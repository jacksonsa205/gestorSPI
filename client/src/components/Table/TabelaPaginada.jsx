import React, { useState } from 'react';
import { Table, Pagination, Badge, Button ,Col} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const TabelaPaginada = ({
  dados,
  colunas,
  itensPorPagina = 15,
  onEditar,
  onExcluir,
  onDetalhes,
  permissoes,
}) => {
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Calcular os índices dos itens da página atual
  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const itensPaginaAtual = dados.slice(indexPrimeiroItem, indexUltimoItem);

  // Calcular o número total de páginas
  const totalPaginas = Math.ceil(dados.length / itensPorPagina);

  // Função para mudar de página
  const mudarPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina);
  };

  // Função para ir para a próxima página
  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  // Função para voltar para a página anterior
  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  // Renderizar os números das páginas
  const renderizarNumerosPaginas = () => {
    const numerosPaginas = [];
    const paginasVisiveis = 15; // Número de páginas visíveis ao redor da página atual

    // Calcular o intervalo de páginas visíveis
    let inicio = Math.max(1, paginaAtual - Math.floor(paginasVisiveis / 2));
    let fim = Math.min(totalPaginas, inicio + paginasVisiveis - 1);

    // Ajustar o início se o fim ultrapassar o total de páginas
    if (fim - inicio + 1 < paginasVisiveis) {
      inicio = Math.max(1, fim - paginasVisiveis + 1);
    }

    // Botão para a primeira página
    if (inicio > 1) {
      numerosPaginas.push(
        <Pagination.Item key={1} onClick={() => mudarPagina(1)}>
          1
        </Pagination.Item>
      );
      if (inicio > 2) {
        numerosPaginas.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
      }
    }

    // Botões das páginas visíveis
    for (let i = inicio; i <= fim; i++) {
      numerosPaginas.push(
        <Pagination.Item
          key={i}
          active={i === paginaAtual}
          onClick={() => mudarPagina(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Botão para a última página
    if (fim < totalPaginas) {
      if (fim < totalPaginas - 1) {
        numerosPaginas.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
      }
      numerosPaginas.push(
        <Pagination.Item key={totalPaginas} onClick={() => mudarPagina(totalPaginas)}>
          {totalPaginas}
        </Pagination.Item>
      );
    }

    return numerosPaginas;
  };

  return (
    <>
      <div className="table-responsive">
        <Table striped hover>
          <thead>
            <tr>
              {colunas.map((coluna, index) => (
                <th key={index} className="tabela-head">
                  {coluna.titulo}
                </th>
              ))}
              <th className="tabela-head">Ações</th>
            </tr>
          </thead>
          <tbody>
            {itensPaginaAtual.map((item, index) => (
              <tr key={index}>
                {colunas.map((coluna, colIndex) => (
                  <td key={colIndex} className="tabela-dados">
                    {coluna.formato ? coluna.formato(item[coluna.chave]) : item[coluna.chave] || "N/A"}
                  </td>
                ))}
                <td className="tabela-dados">
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => onDetalhes(item)}
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                  {permissoes.canEdit && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="ms-2"
                      onClick={() => onEditar(item)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                  )}
                  {permissoes.canDelete && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => onExcluir(item)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Controles de Paginação */}
      <div className="paginacao-container">
        <Col className="d-flex justify-content-center">
            <Pagination>
            <Pagination.Prev onClick={paginaAnterior} disabled={paginaAtual === 1} />
            {renderizarNumerosPaginas()}
            <Pagination.Next onClick={proximaPagina} disabled={paginaAtual === totalPaginas} />
            </Pagination>
        </Col>
      </div>
    </>
  );
};

export default TabelaPaginada;