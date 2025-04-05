import React from 'react';

function Filters({ filterCriteria, setFilterCriteria, applyFilters }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    applyFilters(filterCriteria);
  };

  return (
    <div className="filters">
      <label>
        Jefe de Intervención:
        <input 
          type="text" 
          name="jefe" 
          value={filterCriteria.jefe} 
          onChange={handleChange} 
        />
      </label>
      <label>
        Tipo de Intervención:
        <input 
          type="text" 
          name="tipo" 
          value={filterCriteria.tipo} 
          onChange={handleChange} 
        />
      </label>
      <label>
        Fecha de Inicio:
        <input 
          type="date" 
          name="fechaInicio" 
          value={filterCriteria.fechaInicio} 
          onChange={handleChange} 
        />
      </label>
      <label>
        Fecha de Fin:
        <input 
          type="date" 
          name="fechaFin" 
          value={filterCriteria.fechaFin} 
          onChange={handleChange} 
        />
      </label>
      <button onClick={handleApplyFilters} className="filter-btn">Aplicar Filtros</button>
    </div>
  );
}

export default Filters;