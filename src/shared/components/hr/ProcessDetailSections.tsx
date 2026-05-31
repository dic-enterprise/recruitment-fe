import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';
import type { ProcessDetailSectionId } from '@/shared/lib/process-detail-sections';
import { sectionDomId } from '@/shared/lib/process-detail-sections';

interface ProcessDetailSectionsProps {
  openSections: ProcessDetailSectionId[];
  onOpenSectionsChange: (value: ProcessDetailSectionId[]) => void;
  sections: {
    id: ProcessDetailSectionId;
    title: string;
    children: React.ReactNode;
    highlight?: boolean;
  }[];
}

export function ProcessDetailSections({
  openSections,
  onOpenSectionsChange,
  sections,
}: ProcessDetailSectionsProps) {
  return (
    <Accordion
      type='multiple'
      value={openSections}
      onValueChange={(v) => onOpenSectionsChange(v as ProcessDetailSectionId[])}
      className='space-y-3'
    >
      {sections.map((section) => (
        <AccordionItem
          key={section.id}
          value={section.id}
          id={sectionDomId(section.id)}
          className={cn(
            'scroll-mt-24 rounded-lg border border-border bg-card px-4 border-b',
            section.highlight && openSections.includes(section.id) && 'ring-2 ring-primary/20',
          )}
        >
          <AccordionTrigger className='py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground hover:no-underline'>
            {section.title}
          </AccordionTrigger>
          <AccordionContent className='pb-4 pt-0'>{section.children}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
