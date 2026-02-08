'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Zap, Crown, Activity } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useAppContext } from '@/contexts/app';
import { toast } from 'sonner';
import { ProfileTabs } from './profile-tabs';

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

interface AccountInfo {
  availablePoints: number;
  subscriptionStatus: string;
  subscriptionPlanCode: string | null;
  subscriptionPlanName: string | null;
  subscriptionEndTime: string | null;
}

export function CreditsPanel() {
  const t = useTranslations();
  const locale = useLocale();
  const { data: session } = useSession();
  const { user: contextUser } = useAppContext();

  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [memberOrders, setMemberOrders] = useState<OrderEntity[]>([]);
  const [pointsOrders, setPointsOrders] = useState<OrderEntity[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('credits');

  // Fetch account info
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!session?.user) return;

      try {
        console.log('[CreditsPanel] Fetching account info...');
        const response = await fetch('/api/user/account');
        const data = await response.json();

        if (data.code === 1000 && data.data) {
          setAccountInfo(data.data);
        } else {
          setAccountInfo({
            availablePoints: contextUser?.credits || 0,
            subscriptionStatus: 'inactive',
            subscriptionPlanCode: null,
            subscriptionPlanName: null,
            subscriptionEndTime: null,
          });
        }
      } catch (error) {
        console.error('[CreditsPanel] Failed to fetch account info:', error);
        setAccountInfo({
          availablePoints: contextUser?.credits || 0,
          subscriptionStatus: 'inactive',
          subscriptionPlanCode: null,
          subscriptionPlanName: null,
          subscriptionEndTime: null,
        });
      }
    };

    fetchAccountInfo();
  }, [session, contextUser]);

  // Fetch transactions
  const fetchTransactions = useCallback(async (page: number = 1) => {
    if (!session?.user) return;

    try {
      setLoadingTransactions(true);
      const response = await fetch(`/api/payment/points/transactions?page=${page}&pageSize=10`);
      const data = await response.json();

      if (data.code === 1000 && data.data) {
        const list = data.data.list || [];
        const pagination = data.data.pagination || {};
        const total = Number(pagination.total || 0);
        const pageSize = Number(pagination.size || 10);
        const estimatedTotalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

        setTransactions(list);
        setCurrentPage(page);
        setTotalPages(estimatedTotalPages);
      }
    } catch (error) {
      console.error('[CreditsPanel] Failed to fetch transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  }, [session?.user]);

  // Fetch all orders
  const fetchAllOrders = useCallback(async (page: number = 1) => {
    try {
      setLoadingTransactions(true);
      const response = await fetch(`/api/payment/order/my/list?page=${page}&size=20`);
      const data = await response.json();

      if (data.code === 1000 && data.data) {
        let orders = [];
        let total = 0;

        if (data.data.list && data.data.pagination) {
          orders = data.data.list;
          total = data.data.pagination.total || 0;
          const pageSize = data.data.pagination.size || 20;
          setOrdersCurrentPage(data.data.pagination.page || page);
          setOrdersTotalPages(Math.max(1, Math.ceil(total / pageSize)));
        } else if (data.data.records) {
          orders = data.data.records;
          total = data.data.total || 0;
          setOrdersCurrentPage(page);
          setOrdersTotalPages(Math.max(1, Math.ceil(total / 20)));
        } else if (Array.isArray(data.data)) {
          orders = data.data;
          setOrdersCurrentPage(page);
          setOrdersTotalPages(1);
        }

        const memberFiltered = orders.filter((order: OrderEntity) => {
          const type = (order.orderType || '').toLowerCase();
          return type === 'subscription' || type === 'member' || type === 'vip';
        });

        const pointsFiltered = orders.filter((order: OrderEntity) => {
          const type = (order.orderType || '').toLowerCase();
          return type === 'point' || type === 'points' || type === 'credit';
        });

        setMemberOrders(memberFiltered);
        setPointsOrders(pointsFiltered);
      }
    } catch (error) {
      console.error('[CreditsPanel] Failed to fetch orders:', error);
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (!session?.user) return;

    if (activeTab === 'credits') {
      fetchTransactions(currentPage);
    } else if (activeTab === 'member-orders' || activeTab === 'points-orders') {
      fetchAllOrders(ordersCurrentPage);
    }
  }, [activeTab, currentPage, ordersCurrentPage, session, fetchTransactions, fetchAllOrders]);

  const getMemberName = () => {
    if (!accountInfo) return t('user.no_member');

    const status = accountInfo.subscriptionStatus;
    const planCode = accountInfo.subscriptionPlanCode;

    if (status?.toUpperCase() === 'ACTIVE' && planCode) {
      if (planCode === 'normal_vip_2') {
        return t('user.basic_member');
      } else if (planCode === 'normal_vip_3') {
        return t('user.professional_member');
      }
      return accountInfo.subscriptionPlanName || t('user.member');
    }
    return t('user.no_member');
  };

  return (
    <div className="space-y-6">
      {/* Credits Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-amber-500" />
                <span className="text-muted-foreground">{t('user.credits')}</span>
                <span className="text-3xl font-bold text-foreground">
                  {accountInfo?.availablePoints || contextUser?.credits || 0}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => (window.location.href = `/${locale}/pricing`)}
            >
              {t('user.recharge_credits')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Member Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('user.membership')}</p>
                <p className="text-lg font-semibold text-foreground">{getMemberName()}</p>
                {accountInfo?.subscriptionEndTime && accountInfo.subscriptionStatus?.toUpperCase() === 'ACTIVE' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('user.valid_until')}: {new Date(accountInfo.subscriptionEndTime).toLocaleDateString(locale)}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="default"
              className="shrink-0"
              onClick={() => (window.location.href = `/${locale}/pricing`)}
            >
              <Crown className="h-4 w-4 mr-2" />
              {t('user.upgrade_membership')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t('user.transaction_history')}
            </h3>
          </div>
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            transactions={transactions}
            memberOrders={memberOrders}
            pointsOrders={pointsOrders}
            loading={loadingTransactions}
            currentPage={activeTab === 'credits' ? currentPage : ordersCurrentPage}
            totalPages={activeTab === 'credits' ? totalPages : ordersTotalPages}
            onPageChange={(page) => {
              if (activeTab === 'credits') {
                setCurrentPage(page);
                fetchTransactions(page);
              } else {
                setOrdersCurrentPage(page);
                fetchAllOrders(page);
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}




