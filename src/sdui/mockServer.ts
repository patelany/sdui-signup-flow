import type { SDUIFlow } from "./schema";

export type Variant = 'A' | 'B';

export async function fetchFlow(variant: Variant): Promise<SDUIFlow>{
    await new Promise((r)=> setTimeout(r, 200)); //simulate network

    if(variant === 'A'){
        return {
            id: 'signup-flow',
            version: 1, 
            pages: [
                {
                    id: 'plan',
                    title: 'Choose your plan',
                    components: [
                        {id: 'h1', type: 'TextBlock', props: {text: 'Pick a plan'}},
                        {
                            id: 'plans',
                            type: 'PlanSelector',
                            props: {
                                name: 'plan',
                                required: true,
                                options: [
                                    {id: 'standard', title: 'Standard', price: '$15.49'},
                                    {id: 'premium', title: 'Premium', price: '$22.99'},
                                ],
                            },
                        },
                        {
                            id: 'next', type: 'Button', props: {text: 'Continue', action: 'NEXT'}
                        }
                    ],
                },
                {
                    id: 'account',
                    title: 'Create your account',
                    components: [
                        {id: 'h2', type: 'TextBlock', props: {text: 'Account details'}},
                        {
                            id: 'email',
                            type: 'TextInput',
                            props: {label: 'Email', name: 'email', placeholder: 'you@example.com', required: true},
                        },
                        {
                            id: 'password',
                            type: 'TextInput',
                            props: {label: 'Password', name: 'password', placeholder: '123example!', required: true},
                        },
                        {id: 'submit', type: 'Button', props: {text: 'Start membership', action: 'SUBMIT'}},
                    ],
                },
            ],
        };
    }

    //Variant B: different copy + extra plan option (simple A/B teset)
    return {
        id: 'signup-flow',
        version: 1,
        pages: [
            {
                id: 'plan',
                title: 'Find the right plan',
                components: [
                    {id: 'h1', type: 'TextBlock', props: {text: 'Most people choose Premium'}},
                    {
                        id: 'plans',
                        type: 'PlanSelector',
                        props: {
                            name: 'plan',
                            required: true,
                            options: [
                                {id: 'basic', title: 'Basic', price: '$6.99'},
                                {id: 'standard', title: 'Standard', price: '$15.49'},
                                {id: 'premium', title: 'Premium', price: '$22.99'},
                            ],
                        },
                    },
                    {id: 'next', type: 'Button', props: {text: 'Next', action: 'NEXT'}},
                ],
            },
            {
                id: 'account',
                title: 'Set up your login',
                components: [
                    {id: 'h2', type: 'TextBlock', props: {text: 'One last step'}},
                    {
                        id: 'email',
                        type: 'TextInput',
                        props: {label: 'Email address', name: 'email', placeholder: 'you@example.com', required: true},
                    },
                    {
                        id: 'password',
                        type: 'TextInput',
                        props: {label: 'Password', name: 'password', placeholder: '123example!', required: true},
                    },
                    {id: 'submit', type: 'Button', props: {text: 'Join now', action: 'SUBMIT'}},
                ],
            },
        ],
    };
}