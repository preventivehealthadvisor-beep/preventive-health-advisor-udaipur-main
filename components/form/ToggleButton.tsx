
import React from 'react';
import { t } from '../../locales/index.ts';

interface ToggleButtonProps {
    value: boolean;
    onChange: (value: boolean) => void;
    className?: string;
    onToggle: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ value, onChange, className, onToggle }) => {
    return (
        <button 
            type="button" 
            role="switch"
            aria-checked={value}
            onClick={() => { onChange(!value); onToggle(); }} 
            className={`toggle-button ${value ? 'selected' : ''} ${className || ''}`}
        >
            <span className="toggle-text">{value ? t('yes') : t('no')}</span>
        </button>
    );
};

export default ToggleButton;
