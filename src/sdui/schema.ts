export type ComponentType = 'TextBlock' | 'TextInput' | 'PlanSelector' | 'Button';

export type SDUIComponent = 
| {
    id: string;
    type: 'TextBlock';
    props: {text: string};
} 
| {
    id: string;
    type: 'TextInput';
    props: {
        label: string; 
        name: 'email' | 'password'; 
        placeholder?: string; 
        required?: boolean; 
    };
}
| {
    id: string; 
    type: 'PlanSelector';
    props: {
        name: 'plan';
        options: Array<{id: string; title: string; price: string}>;
        required?: boolean; 
    };
}
| {
    id: string; 
    type: 'Button';
    props: {text: string; action: 'NEXT' | 'SUBMIT'};
};

export interface SDUIPage {
    id: string; 
    title: string; 
    components: SDUIComponent[];
}

export interface SDUIFlow {
    id: string; 
    version: number;
    pages: SDUIPage[];
}