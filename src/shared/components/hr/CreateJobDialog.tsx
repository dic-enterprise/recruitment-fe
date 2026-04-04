import { useMemo, useState, type ReactNode } from "react";
import {
  Briefcase,
  Bold,
  Italic,
  Link2,
  List,
  MapPin,
  Plus,
  Sparkles,
  Target,
  FileText,
  X,
} from "lucide-react";
import { BaseDialog, BaseHeader, BaseAction } from "@/shared/components/dialog";
import type { CloseModal } from "@/shared/hooks/useModal.ts";
import { Button } from "@/shared/components/ui/button.tsx";
import { Input } from "@/shared/components/ui/input.tsx";
import { Label } from "@/shared/components/ui/label.tsx";
import { Textarea } from "@/shared/components/ui/textarea.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card.tsx";
import { Progress } from "@/shared/components/ui/progress.tsx";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group.tsx";
import { Badge } from "@/shared/components/ui/badge.tsx";
import { departments, type Job } from "@/shared/lib/mock-data.ts";

function formatVnd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  return n.toLocaleString("vi-VN");
}

function parseVndDigits(raw: string): number | undefined {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : undefined;
}

function buildSalaryLabel(min?: number, max?: number): string | undefined {
  if (min != null && max != null) return `${formatVnd(min)} – ${formatVnd(max)} VND`;
  if (min != null) return `Từ ${formatVnd(min)} VND`;
  if (max != null) return `Đến ${formatVnd(max)} VND`;
  return undefined;
}

function computeProgress(p: {
  title: string;
  departmentId: string;
  salaryMin: string;
  salaryMax: string;
  location: string;
  description: string;
  skills: string[];
}): number {
  let pts = 0;
  if (p.title.trim()) pts += 18;
  if (p.departmentId) pts += 15;
  if (parseVndDigits(p.salaryMin) && parseVndDigits(p.salaryMax)) pts += 18;
  else if (parseVndDigits(p.salaryMin) || parseVndDigits(p.salaryMax)) pts += 9;
  if (p.location.trim()) pts += 12;
  if (p.description.trim().length > 40) pts += 22;
  else if (p.description.trim()) pts += 12;
  if (p.skills.length > 0) pts += 15;
  return Math.min(100, Math.round(pts));
}

const SUGGESTED_SKILLS = ["User Research", "Design Systems", "Agile", "React", "Communication"];

export type CreateJobModalProps = {
  close: CloseModal<Job | undefined>;
  onJobCreated: (job: Job) => void;
};

export function CreateJobModal({ close, onJobCreated }: CreateJobModalProps) {
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [recruitmentUrgency, setRecruitmentUrgency] = useState<"NORMAL" | "URGENT">("URGENT");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [location, setLocation] = useState("");
  const [workplace, setWorkplace] = useState<string[]>(["hybrid", "fulltime"]);
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>(["Figma", "UI/UX Design", "Prototyping"]);
  const [skillDraft, setSkillDraft] = useState("");

  const dept = departments.find(d => d.id === departmentId);

  const progress = useMemo(
    () => computeProgress({ title, departmentId, salaryMin, salaryMax, location, description, skills }),
    [title, departmentId, salaryMin, salaryMax, location, description, skills],
  );

  const reset = () => {
    setTitle("");
    setDepartmentId("");
    setRecruitmentUrgency("URGENT");
    setSalaryMin("");
    setSalaryMax("");
    setLocation("");
    setWorkplace(["hybrid", "fulltime"]);
    setDescription("");
    setSkills(["Figma", "UI/UX Design", "Prototyping"]);
    setSkillDraft("");
  };

  const applyAiInsight = () => {
    const line = "Yêu cầu nộp portfolio (PDF hoặc link) cùng hồ sơ.";
    setDescription(prev => (prev.trim() ? `${prev.trim()}\n\n${line}` : line));
  };

  const insertAroundSelection = (before: string, after: string) => {
    const el = document.getElementById("create-job-description") as HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const v = el.value;
    const sel = v.slice(start, end);
    const next = v.slice(0, start) + before + sel + after + v.slice(end);
    setDescription(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + sel.length + after.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const addSkill = (s: string) => {
    const t = s.trim();
    if (!t || skills.includes(t)) return;
    setSkills(prev => [...prev, t]);
    setSkillDraft("");
  };

  const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s));

  const handleSubmit = () => {
    if (!title.trim() || !departmentId || !dept) return;
    const min = parseVndDigits(salaryMin);
    const max = parseVndDigits(salaryMax);
    const workplaceHybrid = workplace.includes("hybrid");
    const employmentFullTime = workplace.includes("fulltime");
    const skillsLine = skills.length ? `\n\nKỹ năng: ${skills.join(", ")}.` : "";
    const urgencyLine = recruitmentUrgency === "URGENT" ? "\n\n[Ưu tiên tuyển dụng khẩn cấp]" : "";
    const requirements = `${description.trim()}${skillsLine}${urgencyLine}`.trim();

    const job: Job = {
      id: `job-${Date.now()}`,
      departmentId: dept.id,
      departmentName: dept.name,
      title: title.trim(),
      salary: buildSalaryLabel(min, max),
      requirements: requirements || "—",
      status: "ACTIVE",
      createdAt: new Date().toISOString().slice(0, 10),
      matchCount: 0,
      highMatchCount: 0,
      location: location.trim() || undefined,
      workplaceHybrid,
      employmentFullTime,
      recruitmentUrgency,
      skills: skills.length ? skills : undefined,
    };
    onJobCreated(job);
    reset();
    close(job);
  };

  const sectionTitle = (n: number, icon: ReactNode, text: string) => (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {n}
      </span>
      <span className="text-primary">{icon}</span>
      <CardTitle className="text-base font-semibold">{text}</CardTitle>
    </div>
  );

  return (
    <BaseDialog
      onDismiss={() => {
        reset();
        close(undefined);
      }}
      header={<BaseHeader title="Tạo tin tuyển dụng" />}
      body={
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              {sectionTitle(1, <Briefcase className="h-4 w-4" />, "Thông tin cốt lõi")}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cj-title">Chức danh công việc</Label>
                <Input
                  id="cj-title"
                  placeholder="VD: Senior Product Designer"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phòng ban</Label>
                <Select value={departmentId || undefined} onValueChange={setDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái tuyển</Label>
                <Select value={recruitmentUrgency} onValueChange={v => setRecruitmentUrgency(v as "NORMAL" | "URGENT")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">Khẩn cấp (Ưu tiên)</SelectItem>
                    <SelectItem value="NORMAL">Bình thường</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              {sectionTitle(2, <MapPin className="h-4 w-4" />, "Chế độ & Địa điểm")}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mức lương dự kiến (VNĐ)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Tối thiểu"
                      value={salaryMin}
                      onChange={e => {
                        const n = parseVndDigits(e.target.value);
                        setSalaryMin(n != null ? formatVnd(n) : "");
                      }}
                      inputMode="numeric"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      placeholder="Tối đa"
                      value={salaryMax}
                      onChange={e => {
                        const n = parseVndDigits(e.target.value);
                        setSalaryMax(n != null ? formatVnd(n) : "");
                      }}
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cj-location">Địa điểm làm việc</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="cj-location"
                      className="pl-9"
                      placeholder="Quận 1, TP. Hồ Chí Minh"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                  <ToggleGroup
                    type="multiple"
                    value={workplace}
                    onValueChange={setWorkplace}
                    variant="outline"
                    size="sm"
                    className="justify-start pt-1"
                  >
                    <ToggleGroupItem value="hybrid" aria-label="Hybrid">
                      Hybrid
                    </ToggleGroupItem>
                    <ToggleGroupItem value="fulltime" aria-label="Toàn thời gian">
                      Toàn thời gian
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              {sectionTitle(3, <FileText className="h-4 w-4" />, "Mô tả công việc")}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-1 rounded-md border bg-muted/30 p-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAroundSelection("**", "**")}>
                  <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAroundSelection("*", "*")}>
                  <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAroundSelection("\n- ", "")}>
                  <List className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAroundSelection("[", "](https://)")}>
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="create-job-description"
                className="min-h-[140px] resize-y"
                placeholder="Viết mô tả chi tiết về vai trò, trách nhiệm và văn hóa đội ngũ..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span>
                    <span className="font-medium">AI Insight:</span> Thêm &apos;Yêu cầu Portfolio&apos; để thu hút ứng viên chất lượng
                    hơn.
                  </span>
                </div>
                <Button type="button" variant="link" className="h-auto shrink-0 px-2 text-sky-700 dark:text-sky-300" onClick={applyAiInsight}>
                  Áp dụng
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              {sectionTitle(4, <Target className="h-4 w-4" />, "Kỹ năng mục tiêu")}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <Badge key={s} variant="secondary" className="gap-1 pr-1 font-normal">
                    {s}
                    <button
                      type="button"
                      className="ml-0.5 rounded-full p-0.5 hover:bg-background/80"
                      onClick={() => removeSkill(s)}
                      aria-label={`Xóa ${s}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Thêm kỹ năng khác (VD: React, Communication...)"
                  value={skillDraft}
                  onChange={e => setSkillDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(skillDraft);
                    }
                  }}
                />
                <Button type="button" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => addSkill(skillDraft)}>
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Gợi ý từ hệ thống</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).map(s => (
                    <Button key={s} type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => addSkill(s)}>
                      + {s}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
      action={
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm text-muted-foreground">Thông tin hoàn tất {progress}%</p>
            <Progress value={progress} className="h-2" />
          </div>
          <BaseAction
            className="sm:min-w-[140px]"
            actions={[
              {
                title: "Đăng tuyển",
                actionCallback: handleSubmit,
                color: "primary",
                disabled: !title.trim() || !departmentId,
              },
            ]}
          />
        </div>
      }
    />
  );
}
