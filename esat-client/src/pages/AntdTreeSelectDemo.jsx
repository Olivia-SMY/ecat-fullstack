import React, { useState } from 'react';
import { TreeSelect } from 'antd';

const treeData = [
  {
    title: 'Mechanics',
    value: 'mechanics',
    children: [
      { title: 'Kinematics', value: 'kinematics' },
      { title: 'Statics', value: 'statics' },
      {
        title: 'Dynamics',
        value: 'dynamics',
        children: [
          { title: "Newton's Law", value: "newton's law" },
          // ...etc
        ]
      }
    ]
  },
  // ...other groups
];

export default function AntdTreeSelectDemo() {
  const [value, setValue] = useState([]);
  return (
    <TreeSelect
      treeData={treeData}
      value={value}
      onChange={setValue}
      treeCheckable={true}
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      placeholder="请选择标签"
      style={{ width: 300 }}
      multiple
    />
  );
} 