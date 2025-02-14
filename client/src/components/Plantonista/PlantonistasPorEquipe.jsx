import './PlantonistasPorEquipe.css';
import CrachaPlantonista from './CrachaPlantonista';

const PlantonistasPorEquipe = ({ titulo, plantonistas }) => {
  return (
    <div className="equipe-container">
      <h3 className="equipe-titulo">{titulo}</h3>
      <div className="membros-container">
        {plantonistas.map((plantonista, index) => (
          <CrachaPlantonista key={index} {...plantonista} />
        ))}
      </div>
    </div>
  );
};

export default PlantonistasPorEquipe;