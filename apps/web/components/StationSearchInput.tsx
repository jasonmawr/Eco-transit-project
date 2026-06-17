import React from 'react';
import { StationCombobox } from './ui/station-combobox';

interface Station {
  id: string;
  name: string;
  lineName: string;
}

interface StationSearchInputProps {
  label: string;
  placeholder: string;
  stations: Station[];
  value: string;
  onChange: (value: string) => void;
  icon: string;
}

export default function StationSearchInput({
  label,
  placeholder,
  stations,
  value,
  onChange,
  icon,
}: StationSearchInputProps) {
  return (
    <StationCombobox
      label={label}
      placeholder={placeholder}
      stations={stations}
      value={value}
      onChange={onChange}
      icon={icon}
    />
  );
}

