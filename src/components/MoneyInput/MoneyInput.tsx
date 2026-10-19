import { Input } from '../Input/Input';
import { formatMoneyInput, parseMoney } from '../../utils/format';
import type { ComponentProps } from 'react';

export function MoneyInput(props: Omit<ComponentProps<typeof Input>, 'type' | 'onChange' | 'value'> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { value, onValueChange, ...rest } = props;
  return <Input {...rest} type="text" inputMode="decimal" placeholder="0,00" maxLength={24}
    value={value} onChange={(event) => onValueChange(event.target.value)}
    onBlur={() => { const amount = parseMoney(value); if (Number.isFinite(amount)) onValueChange(formatMoneyInput(amount)); }} />;
}
