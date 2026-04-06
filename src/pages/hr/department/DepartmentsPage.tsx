import {Link} from "react-router-dom";
import {Card, CardContent, CardHeader, CardTitle} from "@/shared/components/ui/card.tsx";
import {departments} from "@/shared/lib/mock-data.ts";
import PageHeader from "@/shared/components/PageHeader.tsx";
import {Building2, Mail, Phone, Plus, User} from "lucide-react";
import {Button} from "@/shared/components/ui/button.tsx";
import useModal from "@/shared/hooks/useModal.ts";
import UpsertDepartmentDialog from "@/pages/hr/department/comps/UpsertDepartmentDialog.tsx";
import React from "react";

export default function DepartmentsPage() {
    const [modalNode, openModal] = useModal();

    async function openCreateDepartment() {
        await openModal(close => (
            <UpsertDepartmentDialog
                department={null}
                onClose={close}
                onSubmit={() => {
                }}
            />
        ));
    }

    return (
        <React.Fragment>
            <div>
                <PageHeader title="Departments" description="Manage company departments" actions={
                    <Button onClick={openCreateDepartment}>
                        <Plus className="mr-2 h-4 w-4"/>
                        Create Department
                    </Button>
                }/>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {departments.map(dept => (
                        <Link key={dept.id} to={`/hr/departments/${dept.id}`}>
                            <Card className="transition-shadow hover:shadow-md animate-slide-up cursor-pointer">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{dept.name}</CardTitle>
                                        <span
                                            className="rounded-md bg-secondary px-2 py-1 text-xs font-mono text-secondary-foreground">{dept.code}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    {dept.manager && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="h-3.5 w-3.5"/>
                                            <span>{dept.manager}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Building2 className="h-3.5 w-3.5"/>
                                        <span>{dept.jobCount} job(s)</span>
                                    </div>
                                    {dept.contacts[0] && (
                                        <div className="flex flex-col gap-1 pt-1 border-t">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="h-3.5 w-3.5"/>
                                                <span className="truncate">{dept.contacts[0].email}</span>
                                            </div>
                                            {dept.contacts[0].phone && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="h-3.5 w-3.5"/>
                                                    <span>{dept.contacts[0].phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
            {modalNode}
        </React.Fragment>
    );
}
