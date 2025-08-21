import React from 'react';

const getSummaryStyle = (result) => {
  let color = 'black';
  if (result && result.toLowerCase().includes('defeated')) color = 'green';
  if (result && result.toLowerCase().includes('vanguished')) color = 'red';
  return {
    border: '2px solid black',
    padding: '1em',
    margin: '1em 0',
    color,
    background: '#fff',
    borderRadius: '8px',
    fontWeight: 'bold',
    textAlign: 'center'
  };
};

const Summary = ({ result }) => (
  <div style={getSummaryStyle(result)}>
    <h2 style={{marginTop: 0}}>Fight Summary</h2>
    <p style={{margin: 0}}>{result}</p>
  </div>
);

export default Summary;
