import React from 'react';

// This is our HOC - it adds a border to any component
function withBorder(WrappedComponent) {
  return function NewComponent(props) {
    return (
      <div style={{ border: '5px solid blue', padding: '10px' }}>
        <WrappedComponent {...props} />
      </div>
    );
  };
}


function FruitList() {
  const fruits = ['Apple', 'Apple', 'Orange'];

  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}

const FruitListWithBorder = withBorder(FruitList);

export default FruitListWithBorder;