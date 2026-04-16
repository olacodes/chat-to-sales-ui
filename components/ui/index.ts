/**
 * UI component barrel.
 * Import shared UI primitives from here:
 *   import { Button, Input, Card, Badge } from '@/components/ui';
 */

export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

export { Input, inputVariants } from './Input';
export type { InputProps } from './Input';

export { Card, CardHeader, CardBody, CardFooter, cardVariants } from './Card';

export { Badge, badgeVariants } from './Badge';
export type { BadgeProps } from './Badge';

export {
  Skeleton,
  SkeletonConversationList,
  SkeletonMessageThread,
  SkeletonKpiCard,
  SkeletonTableRows,
} from './Skeleton';

export { EmptyState } from './EmptyState';
export { ErrorState, ErrorBanner } from './ErrorState';
export { ThemeToggle } from './ThemeToggle';

export { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from './Table';

export { Modal, Drawer, ModalHeader, ModalBody, ModalFooter } from './Modal';
