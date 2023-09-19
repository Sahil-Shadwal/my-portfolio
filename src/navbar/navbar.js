import React, { useState } from 'react';
import './styles.css'; // Import the CSS file
import { motion } from 'framer-motion';

const Tabs = () => {
  const [focused, setFocused] = useState(null);
  const [selected, setSelected] = useState('Item 1');
  const tabs = ['Home', 'Projects', 'Contact'];

  return (
    <ul className="wrapper" onMouseLeave={() => setFocused(null)}>
      {tabs.map((item) => (
        <li
          key={item}
          className={`tab ${focused === item ? 'focused' : ''} ${
            selected === item ? 'selected' : ''
          }`}
          onClick={() => setSelected(item)}
          onKeyDown={(event) => (event.key === 'Enter' ? setSelected(item) : null)}
          onFocus={() => setFocused(item)}
          onMouseEnter={() => setFocused(item)}
          tabIndex={0}
        >
          <span>{item}</span>
          {focused === item ? (
            <motion.div
              transition={{
                layout: {
                  duration: 0.2,
                  ease: 'easeOut',
                },
              }}
              style={{
                position: 'absolute',
                bottom: '-2px',
                left: '-10px',
                right: 0,
                width: '140%',
                height: '110%',
                background: '#23272F',
                borderRadius: '8px',
                zIndex: 1,
              }}
              layoutId="highlight"
            />
          ) : null}
          {selected === item ? (
            <motion.div
              style={{
                position: 'absolute',
                bottom: '-10px',
                left: '0px',
                right: 0,
                height: '4px',
                background: '#56f5d8',
                borderRadius: '8px',
                zIndex: 1,
              }}
              layoutId="underline"
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
};

export default Tabs;
