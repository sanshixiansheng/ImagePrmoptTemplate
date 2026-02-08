'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Loader2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import moment from 'moment';
import { cn } from '@/lib/utils';

interface CreditTransaction {
  id: number;
  userId: number;
  pointsChange: number;
  pointsBalance: number;
  businessType: string;
  businessNo: string;
  createTime: string;
  updateTime: string;
}

interface OrderEntity {
  id: number;
  orderNo: string;
  userId: number;
  amount: number;
  status: string;
  payType: string;
  payTime?: string;
  payTradeNo?: string;
  orderDescription?: string;
  orderType: string;
  duration?: string;
  planCode?: string;
  giftPoints?: number;
  days?: number;
  numbers?: number;
  createTime: string;
  updateTime: string;
}

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  transactions: CreditTransaction[];
  memberOrders: OrderEntity[];
  pointsOrders: OrderEntity[];
  loading: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  transactions,
  memberOrders,
  pointsOrders,
  loading,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: ProfileTabsProps) {
  const t = useTranslations();

  const generatePageNumbers = (current: number, total: number) => {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (total <= maxPagesToShow) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    if (current <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push(-1, total);
      return pages;
    }

    if (current >= total - 2) {
      pages.push(1, -1);
      for (let i = total - 3; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1, -1, current - 1, current, current + 1, -1, total);
    return pages;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
    > = {
      create: { label: t('order.status_created'), variant: 'secondary' },
      paid: { label: t('order.status_paid'), variant: 'outline' },
      cancel: { label: t('order.status_cancelled'), variant: 'destructive' },
      cancelled: { label: t('order.status_cancelled'), variant: 'destructive' },
      pending: { label: t('order.status_pending'), variant: 'default' },
      failed: { label: t('order.status_failed'), variant: 'destructive' },
    };

    const statusInfo = statusMap[status?.toLowerCase()] || {
      label: status,
      variant: 'default' as const,
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatAmount = (amount: number) => {
    const displayAmount = amount > 1000 ? amount / 100 : amount;
    return `¥${displayAmount.toFixed(2)}`;
  };

  const formatDuration = (duration?: string, numbers?: number) => {
    if (!duration) return '-';

    const count = numbers || 1;
    const durationMap: Record<string, string> = {
      month: count === 1 ? '1 month' : `${count} months`,
      year: count === 1 ? '1 year' : `${count} years`,
      day: count === 1 ? '1 day' : `${count} days`,
    };

    return durationMap[duration] || `${count} ${duration}`;
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="flex gap-8 border-b px-6">
        <button
          onClick={() => onTabChange('credits')}
          className={cn(
            'relative pb-3 text-sm font-medium transition-colors',
            activeTab === 'credits' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t('user.credit_history')}
          {activeTab === 'credits' && <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => onTabChange('member-orders')}
          className={cn(
            'relative pb-3 text-sm font-medium transition-colors',
            activeTab === 'member-orders'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t('user.member_orders')}
          {activeTab === 'member-orders' && (
            <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => onTabChange('points-orders')}
          className={cn(
            'relative pb-3 text-sm font-medium transition-colors',
            activeTab === 'points-orders'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t('user.points_orders')}
          {activeTab === 'points-orders' && (
            <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <TabsContent value="credits" className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 border-b pb-2 text-sm font-medium text-muted-foreground">
            <span>{t('user.transaction_type')}</span>
            <span>{t('user.credits_change')}</span>
            <span>{t('user.time')}</span>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((transaction) => {
              const isIncome = transaction.pointsChange > 0;
              return (
                <div key={transaction.id} className="grid grid-cols-3 gap-4 border-b py-3 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{transaction.businessType}</span>
                  </div>
                  <span className={cn('text-sm font-medium', isIncome ? 'text-green-600' : 'text-red-600')}>
                    {isIncome ? '+' : '-'}
                    {Math.abs(transaction.pointsChange)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {moment(transaction.createTime).format('YYYY/MM/DD HH:mm')}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground">{t('user.no_transactions')}</div>
          )}
        </div>

        {onPageChange && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="whitespace-nowrap text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Pagination className="flex-shrink-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {generatePageNumbers(currentPage, totalPages).map((page, index) => (
                  <PaginationItem key={index}>
                    {page === -1 ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => onPageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </TabsContent>

      <TabsContent value="member-orders" className="p-6">
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : memberOrders.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 border-b pb-2 text-sm font-medium text-muted-foreground">
              <span>{t('order.order_no')}</span>
              <span>{t('order.description')}</span>
              <span>{t('order.duration')}</span>
              <span>{t('order.amount')}</span>
              <span>{t('order.status')}</span>
              <span>{t('order.created_at')}</span>
            </div>
            {memberOrders.map((order) => (
              <div key={order.id} className="grid grid-cols-6 gap-4 border-b py-3 last:border-b-0">
                <span className="truncate font-mono text-sm">{order.orderNo}</span>
                <span className="text-sm">{order.orderDescription || '-'}</span>
                <span className="text-sm">{formatDuration(order.duration, order.numbers)}</span>
                <span className="text-sm font-medium">{formatAmount(order.amount)}</span>
                <div>{getStatusBadge(order.status)}</div>
                <span className="text-sm text-muted-foreground">
                  {moment(order.createTime).format('YYYY/MM/DD HH:mm')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">{t('order.no_member_orders')}</div>
        )}
      </TabsContent>

      <TabsContent value="points-orders" className="p-6">
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pointsOrders.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 border-b pb-2 text-sm font-medium text-muted-foreground">
              <span>{t('order.order_no')}</span>
              <span>{t('order.description')}</span>
              <span>{t('order.points')}</span>
              <span>{t('order.amount')}</span>
              <span>{t('order.status')}</span>
              <span>{t('order.created_at')}</span>
            </div>
            {pointsOrders.map((order) => (
              <div key={order.id} className="grid grid-cols-6 gap-4 border-b py-3 last:border-b-0">
                <span className="truncate font-mono text-sm">{order.orderNo}</span>
                <span className="text-sm">{order.orderDescription || 'Points recharge'}</span>
                <span className="text-sm">{order.giftPoints ? `${order.giftPoints} pts` : '-'}</span>
                <span className="text-sm font-medium">{formatAmount(order.amount)}</span>
                <div>{getStatusBadge(order.status)}</div>
                <span className="text-sm text-muted-foreground">
                  {moment(order.createTime).format('YYYY/MM/DD HH:mm')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">{t('order.no_points_orders')}</div>
        )}
      </TabsContent>
    </Tabs>
  );
}
