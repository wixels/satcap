import { NavLink } from '@mantine/core';
import { IconHome2 } from '@tabler/icons';
import { Link } from '@tanstack/react-location';
import React from 'react';

type Props = {
  path: string;
  label: string;
  icon: JSX.Element;
};

export const NavbarLink = (props: Props) => {
  return (
    <Link to={props.path} preload={1}>
      {({ isActive }) => {
        return (
          <NavLink
            sx={(theme) => ({
              borderRight: isActive
                ? `6px solid ${theme.colors.indigo[4]}`
                : '',
            })}
            active={isActive}
            label={props.label}
            icon={props.icon}
            p="md"
            pl={'xl'}
          />
        );
      }}
    </Link>
  );
};
