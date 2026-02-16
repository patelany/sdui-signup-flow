import type { SDUIComponent } from "./schema";
import {registry} from './registry';

export type FormState = {
    plan?: string;
    email?: string; 
    password?: string; 
};

export type FormErrors = Partial<Record<keyof FormState, string>>;

type RenderContext = {
    form: FormState; 
    errors: FormErrors;
    onFieldChange: (name: keyof FormState,value: string ) => void; 
    onAction: (action: 'NEXT' | 'SUBMIT')=> void; 
}

export function renderComponent(component: SDUIComponent, ctx: RenderContext){
    switch (component.type) {
        case 'TextBlock': {
            const C = registry.TextBlock;
            return <C key={component.id}{...component.props}/>;
        }
        
        case 'TextInput': {
            const C = registry.TextInput;
            const name = component.props.name;
            return (
                <C
                    key={component.id}
                    {...component.props}
                    value={ctx.form[name] ?? ''}
                    error={ctx.errors[name]}
                    onChange={(n, v)=> ctx.onFieldChange(n, v)}
                    />
            );
        }

        case 'PlanSelector': {
            const C = registry.PlanSelector;
            return (
                <C
                    key={component.id}
                    {...component.props}
                    value={ctx.form.plan ?? ''}
                    error={ctx.errors.plan}
                    onChange={(n, v) => ctx.onFieldChange(n, v)}
                />
            );
        }

        case 'Button': {
            const C = registry.Button;
            return (
                <C
                    key={component.id}
                    text={component.props.text}
                    onClick={()=> ctx.onAction(component.props.action)}
                    type="button"
                />
            );
        }

        default: 
        return null;
    }

}