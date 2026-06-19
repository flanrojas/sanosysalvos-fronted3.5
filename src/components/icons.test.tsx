import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CompassIcon,
  HeartIcon,
  MapPinIcon,
  PawIcon,
  PhoneIcon,
  PlusIcon,
  RulerIcon,
  SearchIcon,
  TrashIcon,
  UserIcon,
} from './icons';

const icons = [
  PawIcon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
  ArrowLeftIcon,
  TrashIcon,
  PhoneIcon,
  CalendarIcon,
  RulerIcon,
  CompassIcon,
  HeartIcon,
  UserIcon,
];

describe('icons', () => {
  it('renderiza todos los iconos con tamaño configurable', () => {
    const { container } = render(
      <div>
        {icons.map((Icon, index) => (
          <Icon key={index} size={24} data-testid={`icon-${index}`} />
        ))}
      </div>,
    );

    const rendered = container.querySelectorAll('svg');
    expect(rendered).toHaveLength(icons.length);
    rendered.forEach((svg) => {
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });
  });
});
