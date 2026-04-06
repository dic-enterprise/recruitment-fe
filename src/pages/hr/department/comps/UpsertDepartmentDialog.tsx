import React, {useState} from "react";
import {Department} from "@/shared/lib/mock-data.ts";
import {BaseDialog, BaseHeader} from "@/shared/components/dialog";
import useForm from "@/shared/hooks/useForm.ts";
import {AppValidation, sleep} from "@/shared/utils/Utils.ts";
import {Flex, TextField} from "@radix-ui/themes";
import {CloseModal} from "@/shared/hooks/useModal.ts";

type Nullable<T> = T | null | undefined;

interface UpsertDepartmentDialogProps {
    onClose: CloseModal
    department: Nullable<Department>;
    onSubmit: (department: Department) => void;
}

const UpsertDepartmentDialog: React.FC<UpsertDepartmentDialogProps> = (props) => {
    const {
        department,
        onSubmit
    } = props

    const [isLoading, setLoading] = useState(false);

    const isCreateNew = department == null;

    type FormType = Partial<Department>

    function initValue(): Department {
        if (isCreateNew) {
            return {
                name: '',
                manager: "",
                code: "",
                contacts: [],
                jobCount: 0,
                id: ""
            }
        }
        return department;
    }

    const form = useForm<FormType>({
        initialValues: initValue(),
        validate(values) {
            return AppValidation.getErrorValidate(values, {
                name: [AppValidation.notEmpty, AppValidation.moreThan8Char],
                manager: [AppValidation.notEmpty]
            })
        },
        onSubmit: async (value) => {
            // TODO: action submit, for now mock loading
            setLoading(true)
            onSubmit(value as Department); // must convert to department
            await sleep(1000)
            setLoading(false)
        }
    });

    console.log({"value": form.values})

    return <BaseDialog isLoading={isLoading} header={<BaseHeader title={isCreateNew ? "Create" : "Edit"}/>}
                       body={<Flex direction={"column"}>
                           <TextField.Root size="1"
                                           onChange={(newValue) => {
                                               form.updateFieldValue("name", newValue.target.value)
                                           }}
                                           placeholder="Search the docs…"
                                           value={form.values.name}/>

                       </Flex>}/>

}

export default UpsertDepartmentDialog;