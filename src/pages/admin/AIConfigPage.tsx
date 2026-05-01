import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/shared/lib/api-services';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import { Badge } from '@/shared/components/ui/badge';
import { Loader2, Plus, Pencil, Cpu, Globe } from 'lucide-react';
import useModal from '@/shared/hooks/useModal';
import UpsertAIProviderDialog from './comps/UpsertAIProviderDialog';
import type { AIProviderConfig } from '@/shared/types/api';

export default function AIConfigPage() {
  const queryClient = useQueryClient();
  const [modalNode, openModal] = useModal();

  const { data: rawConfigs, isLoading } = useQuery({
    queryKey: ['ai-configs'],
    queryFn: adminService.getAIConfig,
  });

  const configs = useMemo(() => {
    if (!rawConfigs) return [];
    // Nếu API đã trả về mảng (đúng chuẩn mới)
    if (Array.isArray(rawConfigs)) return rawConfigs;

    // Fallback nếu API vẫn trả về Object cũ (đang trong quá trình refactor backend)
    const legacy = rawConfigs as any;
    const list: AIProviderConfig[] = [];
    if (legacy.openai) {
      list.push({
        ...legacy.openai,
        id: 1,
        name: 'OpenAI (Default)',
        providerType: 'OPENAI',
        isActive: legacy.active === 'OPENAI',
        enabled: legacy.openai.enabled ?? true,
      });
    }
    if (legacy.gemini) {
      list.push({
        ...legacy.gemini,
        id: 2,
        name: 'Google Gemini (Default)',
        providerType: 'GEMINI',
        isActive: legacy.active === 'GEMINI',
        enabled: legacy.gemini.enabled ?? true,
      });
    }
    return list;
  }, [rawConfigs]);

  const openUpsertDialog = (provider?: AIProviderConfig) => {
    openModal((close) => (
      <UpsertAIProviderDialog
        provider={provider || null}
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
          <span className="font-semibold">{item.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{item.model}</span>
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
      className: 'max-w-[200px] truncate text-xs text-muted-foreground',
    },
    {
      header: 'Status',
      key: 'enabled',
      render: (item) => (
        <div className="flex gap-2">
          {item.enabled ? (
            <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Enabled</Badge>
          ) : (
            <Badge variant="secondary" className="opacity-50">Disabled</Badge>
          )}
          {item.isActive && (
            <Badge className="bg-primary text-primary-foreground">Active</Badge>
          )}
        </div>
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
        description="Quản lý danh sách các nhà cung cấp dịch vụ AI và cấu hình API."
        actions={
          <Button onClick={() => openUpsertDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Provider
          </Button>
        }
      />

      <BaseTable
        data={configs || []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có cấu hình AI nào được tạo."
        showIndex={true}
      />
      {modalNode}
    </div>
  );
}
