import React, { useState } from 'react';
import DropdownTreeSelect from 'react-dropdown-tree-select';
import 'react-dropdown-tree-select/dist/styles.css';

const data = [
  {
    label: 'Parent',
    value: 'parent',
    children: [
      { label: 'Child 1', value: 'child1' },
      { label: 'Child 2', value: 'child2' }
    ]
  }
];

export default function TestTree() {
  const [selected, setSelected] = useState([]);
  return (
    <div style={{ width: 300, margin: 40 }}>
      <DropdownTreeSelect
        data={data}
        onChange={(currentNode, selectedNodes) => setSelected(selectedNodes)}
        texts={{ placeholder: "Select tags" }}
      />
      <div>
        <strong>Selected:</strong>
        <pre>{JSON.stringify(selected, null, 2)}</pre>
      </div>
    </div>
  );
}