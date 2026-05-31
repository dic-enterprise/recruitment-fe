import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/shared/lib/api-services';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import { Badge } from '@/shared/components/ui/badge';
import { Cpu, Globe, Plus, Edit } from 'lucide-react';
import useModal from '@/shared/hooks/useModal';
import UpsertAIProviderDialog from './comps/UpsertAIProviderDialog';
import type { AIProviderConfig } from '@/shared/types/api';

const PROVIDER_LABELS: Record<AIProviderConfig['providerType'], string> = {
  OPENAI: 'OpenAI',
  GEMINI: 'Google Gemini',
};

function displayName(item: AIProviderConfig): string {
  if (item.name?.trim()) return item.name.trim();
  if (item.id != null) return `${PROVIDER_LABELS[item.providerType]} #${item.id}`;
  return PROVIDER_LABELS[item.providerType];
}

function maskApiKey(key: string): string {
  if (!key) return '—';
  if (key.length <= 8) return '••••••••';
  return `${'•'.repeat(12)}${key.slice(-4)}`;
}

export default function AIConfigPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalNode, openModal] = useModal();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['ai-configs'],
    queryFn: adminService.getAIConfig,
  });

  const openUpsertDialog = (provider?: AIProviderConfig) => {
    openModal((close) => (
      <UpsertAIProviderDialog
        provider={provider ?? null}
        allConfigs={configs}
        onClose={close}
        onSubmit={() => {
          queryClient.invalidateQueries({ queryKey: ['ai-configs'] });
        }}
      />
    ));
  };

  const columns: Column<AIProviderConfig>[] = [
    {
      header: t('admin.name'),
      key: 'name',
      render: (item) => (
        <div className='flex flex-col'>
          <span className='font-semibold'>{displayName(item)}</span>
          <span className='text-[10px] text-muted-foreground font-mono'>{item.model || '—'}</span>
        </div>
      ),
    },
    {
      header: t('admin.type'),
      key: 'providerType',
      render: (item) => (
        <Badge variant='outline' className='gap-1 px-1.5 py-0'>
          {item.providerType === 'OPENAI' ? <Cpu className='h-3 w-3' /> : <Globe className='h-3 w-3' />}
          {item.providerType}
        </Badge>
      ),
    },
    {
      header: t('admin.endpoint'),
      key: 'apiUrl',
      className: 'max-w-[220px] truncate text-xs text-muted-foreground',
    },
    {
      header: t('admin.apiKey'),
      key: 'apiKey',
      className: 'font-mono text-xs text-muted-foreground',
      render: (item) => maskApiKey(item.apiKey),
    },
    {
      header: t('admin.status'),
      key: 'enabled',
      render: (item) =>
        item.enabled ? (
          <Badge className='bg-success/10 text-success border-success/20 hover:bg-success/20'>{t('common.enabled')}</Badge>
        ) : (
          <Badge variant='secondary' className='opacity-50'>
            {t('common.disabled')}
          </Badge>
        ),
    },
    {
      header: t('common.actions'),
      key: 'actions',
      width: '100px',
      render: (item) => (
        <Button variant='outline' size='sm' onClick={() => openUpsertDialog(item)}>
          <Edit className='mr-1.5 h-3.5 w-3.5' />
          {t('common.edit')}
        </Button>
      ),
    },
  ];

  return (
    <div className=''>
      <PageHeader
        title={t('admin.aiConfigTitle')}
        description={t('admin.aiConfigDescription')}
        actions={
          <Button onClick={() => openUpsertDialog()} className='gap-2 h-8'>
            <Plus className='h-4 w-4' />
            {t('admin.addConfig')}
          </Button>
        }
      />

      <BaseTable
        data={configs}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={t('admin.emptyAiConfig')}
        showIndex={true}
      />
      {modalNode}
    </div>
  );
}
