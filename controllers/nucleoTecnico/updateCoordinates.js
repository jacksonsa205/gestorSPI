const model = require('../../models/nucleoTecnico/ocorrenciasGV');
const geocodingService = require('../../helpers/geocodingService');
const municipiosModel = require('../../models/municipios/municipios');
const { sleep } = require('../../helpers/sleep');

class UpdateCoordinatesController {
    static async init() {
        this.municipiosList = await municipiosModel.listarMunicipios();
        this.municipiosMap = this.createMunicipiosMap(this.municipiosList);
        console.log(`Carregados ${this.municipiosList.length} municípios para referência (apenas como fallback)`);
    }

    static createMunicipiosMap(municipios) {
        const map = {};
        municipios.forEach(m => {
            const nomePadronizado = m.MUNICIPIO.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase();
            map[nomePadronizado] = m;
        });
        return map;
    }

    static async update(req, res) {
        try {
            await this.init();
            
            const ocorrencias = await model.listarOcorrenciasSemCoordenadas();
            console.log(`Encontradas ${ocorrencias.length} ocorrências sem coordenadas`);

            let updatedCount = 0;
            let errorCount = 0;

            for (const [index, ocorrencia] of ocorrencias.entries()) {
                try {
                    console.log(`[${index + 1}/${ocorrencias.length}] Processando ocorrência ${ocorrencia.OCORRENCIA}...`);
                    
                    let coordinates = null;
                    const address = ocorrencia.mun;
                    
                    // 1ª PRIORIDADE: Tentar API com endereço completo
                    if (address && !address.startsWith('Endereço não localizado')) {
                        coordinates = await this.tryGeocoding(address);
                    }
                    
                    // 2ª PRIORIDADE: Tentar API apenas com município (se endereço completo falhou ou é inválido)
                    if (!coordinates) {
                        const municipio = this.formatMunicipio(address);
                        coordinates = await this.tryGeocoding(`${municipio}, SP`);
                    }
                    
                    // 3ª OPÇÃO (FALLBACK): Usar coordenadas do banco de dados se API falhar
                    if (!coordinates) {
                        coordinates = await this.tryMunicipioFromDB(address);
                    }

                    if (coordinates) {
                        await model.atualizarCoordenadas(
                            ocorrencia.OCORRENCIA,
                            coordinates.lat,
                            coordinates.lng
                        );
                        console.log(`✅ Atualizada ocorrência ${ocorrencia.OCORRENCIA} com lat: ${coordinates.lat}, lng: ${coordinates.lng}`);
                        updatedCount++;
                    } else {
                        console.warn(`⚠️ Não foi possível obter coordenadas para ${address}`);
                        errorCount++;
                    }

                    await sleep(1000); // Intervalo entre requisições
                } catch (error) {
                    console.error(`❌ Erro ao processar ocorrência ${ocorrencia.OCORRENCIA}:`, error.message);
                    errorCount++;
                }
            }

            const message = `Processamento concluído! ${updatedCount} atualizadas, ${errorCount} erros.`;
            console.log(message);
            
            if (res) {
                return res.json({ success: true, message, updatedCount, errorCount });
            }
        } catch (error) {
            console.error('❌ Erro no processo de atualização:', error);
            if (res) {
                return res.status(500).json({ success: false, error: error.message });
            }
        }
    }

    static async tryGeocoding(address) {
        try {
            const cleanedAddress = this.cleanAddress(address);
            const response = await geocodingService.getCoordinates(cleanedAddress);
            
            if (response) {
                console.log(`🌍 API retornou coordenadas para: ${cleanedAddress}`);
                return response;
            }
            return null;
        } catch (error) {
            console.error(`Falha na geocodificação do endereço ${address}:`, error.message);
            return null;
        }
    }

    static async tryMunicipioFromDB(address) {
        try {
            if (!address) return null;
            
            const municipio = this.formatMunicipio(address);
            const municipioKey = this.normalizeName(municipio);
            
            if (this.municipiosMap[municipioKey]) {
                const m = this.municipiosMap[municipioKey];
                console.log(`🔄 Usando coordenadas do banco como fallback para: ${m.MUNICIPIO}`);
                return { lat: m.LAT, lng: m.LNG };
            }
            return null;
        } catch (error) {
            console.error(`Falha ao buscar município no banco: ${address}`, error.message);
            return null;
        }
    }

    static cleanAddress(address) {
        if (!address) return '';
        // Remove espaços extras e formata vírgulas
        return address.trim()
            .replace(/\s+/g, ' ')
            .replace(/\s*,\s*/g, ',');
    }

    static formatMunicipio(address) {
        if (!address) return '';
        
        const parts = address.split(',');
        let municipio = parts.length > 1 ? parts[parts.length - 1] : address;
        municipio = municipio.split('-')[0].trim();
        return municipio;
    }

    static normalizeName(name) {
        return name.normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, "")
                  .toUpperCase();
    }
}

// Execução direta
if (require.main === module) {
    UpdateCoordinatesController.update()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = UpdateCoordinatesController;