import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/shared/lib/api-services';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import { Badge } from '@/shared/components/ui/badge';
import { Pencil, Cpu, Globe, Plus } from 'lucide-react';
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
      header: 'Name',
      key: 'name',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold">{displayName(item)}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{item.model || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      key: 'providerType',
      render: (item) => (
        <Badge variant="outline" className="gap-1 px-1.5 py-0">
          {item.providerType === 'OPENAI' ? <Cpu className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
          {item.providerType}
        </Badge>
      ),
    },
    {
      header: 'Endpoint',
      key: 'apiUrl',
      className: 'max-w-[220px] truncate text-xs text-muted-foreground',
    },
    {
      header: 'API Key',
      key: 'apiKey',
      className: 'font-mono text-xs text-muted-foreground',
      render: (item) => maskApiKey(item.apiKey),
    },
    {
      header: 'Status',
      key: 'enabled',
      render: (item) =>
        item.enabled ? (
          <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Enabled</Badge>
        ) : (
          <Badge variant="secondary" className="opacity-50">Disabled</Badge>
        ),
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (item) => (
        <Button variant="ghost" size="sm" onClick={() => openUpsertDialog(item)}>
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="AI Configuration"
        description="Thêm và quản lý nhiều cấu hình AI. Các bản ghi được bật sẽ được dùng luân phiên (round-robin); lỗi hoặc timeout sẽ chuyển sang cấu hình tiếp theo."
        actions={
          <Button onClick={() => openUpsertDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm cấu hình
          </Button>
        }
      />

      <BaseTable
        data={configs}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có cấu hình AI. Nhấn «Thêm cấu hình» để tạo mới."
        showIndex={true}
      />
      {modalNode}
    </div>
  );
}
