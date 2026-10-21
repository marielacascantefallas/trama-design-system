// Íconos de Hilo y Ruta: Phosphor, peso regular, una sola familia.
// Se exportan con nombres de acción del producto para no depender de la librería en cada pantalla.
import type { ComponentType } from 'react';
import {
  ArrowLeft as PArrowLeft, ArrowRight as PArrowRight, Bell as PBell, Boat, CalendarDots, CaretDown, CaretRight,
  ChartBar, ChatCenteredText, Check as PCheck, Cloud as PCloud, DotsThree, FileText as PFileText, FunnelSimple,
  House, ListBullets, Lock as PLock, MagnifyingGlass, MapPin as PMapPin, Paperclip as PPaperclip, Phone as PPhone,
  SlidersHorizontal as PSliders, Tray, UserCheck as PUserCheck, Users as PUsers, Wallet as PWallet, Warning,
  Waves as PWaves, X as PX, type IconProps,
} from '@phosphor-icons/react';

export interface AppIconProps extends Omit<IconProps, 'weight'> {
  /** Se acepta por compatibilidad y se ignora: Phosphor maneja su propio trazo. */
  strokeWidth?: number;
}

const wrap = (I: ComponentType<IconProps>) => {
  const C = ({ strokeWidth: _s, size = 20, ...rest }: AppIconProps) => <I size={size} weight="regular" {...rest} />;
  return C;
};

export const ArrowLeft = wrap(PArrowLeft);
export const ArrowRight = wrap(PArrowRight);
export const Bell = wrap(PBell);
export const Ship = wrap(Boat);
export const CalendarDays = wrap(CalendarDots);
export const ChevronDown = wrap(CaretDown);
export const ChevronRight = wrap(CaretRight);
export const BarChart3 = wrap(ChartBar);
export const MessageSquare = wrap(ChatCenteredText);
export const Check = wrap(PCheck);
export const Cloud = wrap(PCloud);
export const MoreHorizontal = wrap(DotsThree);
export const FileText = wrap(PFileText);
export const ListFilter = wrap(FunnelSimple);
export const Home = wrap(House);
export const List = wrap(ListBullets);
export const Lock = wrap(PLock);
export const Search = wrap(MagnifyingGlass);
export const MapPin = wrap(PMapPin);
export const Paperclip = wrap(PPaperclip);
export const Phone = wrap(PPhone);
export const SlidersHorizontal = wrap(PSliders);
export const Inbox = wrap(Tray);
export const UserCheck = wrap(PUserCheck);
export const Users = wrap(PUsers);
export const Wallet = wrap(PWallet);
export const AlertTriangle = wrap(Warning);
export const Waves = wrap(PWaves);
export const X = wrap(PX);
