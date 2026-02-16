import {useEffect, useMemo, useState, useRef} from 'react';
import type { SDUIFlow, SDUIPage } from '../sdui/schema';
import {fetchFlow, type Variant} from '../sdui/mockServer';
import { renderComponent, type FormErrors, type FormState } from '../sdui/renderer';
import { bucket } from '../sdui/experiment';

function validatePage(page: SDUIPage, form: FormState): FormErrors{
    const errors: FormErrors = {};

    for (const c of page.components){
        if(c.type === 'TextInput' && c.props.required) {
            const value = form[c.props.name] ?? '';
            if(!value.trim()) errors[c.props.name] = `${c.props.label} is required`;
            if(c.props.name === 'email' && value && !value.includes('@')) errors.email = 'Enter a valid email';
            if(c.props.name === 'password' && value && value.length < 8)
                errors.password = 'Password must be at least 8 characters';
        }

        if(c.type === 'PlanSelector' && c.props.required){
            if(!form.plan) errors.plan = 'Please select a plan';
        }
    }
    
    return errors;
}

export default function FlowPage(){
    const [variant, setVariant] = useState<Variant>('A');
    const [flow, setFlow] = useState<SDUIFlow | null>(null);
    const [pageIndex, setPageIndex] = useState(0);

    const [form, setForm] = useState<FormState>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const page = useMemo(() => (flow ? flow.pages[pageIndex] : null), [flow, pageIndex]);
    const effectivePageId = isSubmitted ? 'success' : page?.id;


    const pageEnterTsRef = useRef<number>(Date.now());
    const prevPageIdRef = useRef<string | null>(null);

    //send events from client
    async function track(event: string, payload?: Record<string, unknown>){

        const body = {
            userId: getUserId(),
            event, 
            flowId: flow?.id, 
            flowVersion: flow?.version,
            variant,
            pageId: effectivePageId,
            ts: new Date().toISOString(),
            ...(payload ?? {}),
        };

        try {
            await fetch('http://localhost:4000/track', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
                keepalive: true,
            });
        } catch {
            console.log('[track-fallback', body);
        }
    }

    function getUserId(){
        const key = 'sdui_user_id';
        const existing = localStorage.getItem(key);

        if(existing) return existing; 

        const id = crypto.randomUUID();
        localStorage.setItem(key, id);

        return id; 
    }

    //assign variant
    useEffect(()=>{
        //manually force a variant for testing
        const params = new URLSearchParams(window.location.search);
        const forced = params.get('variant');

        const id = getUserId();
        const assigned = 
        forced === 'A' || forced === 'B' ? (forced as Variant) : bucket(id);

        setVariant(assigned);

        track('experiment_exposure', {
            experiment: 'signup_flow_variant',
            variant: assigned,
            forced: forced === 'A' || forced === 'B',
        });
    }, []);

    // track page enter & exit 
    useEffect(() => {
    if (!effectivePageId) return;

    const now = Date.now();
    const prevPageId = prevPageIdRef.current;

    if (prevPageId) {
        const msOnPage = now - pageEnterTsRef.current;
        track('page_exit', { from: prevPageId, msOnPage });
    }

    track('page_enter', { pageId: effectivePageId });

    prevPageIdRef.current = effectivePageId;
    pageEnterTsRef.current = now;
 
    }, [effectivePageId]);

    useEffect(()=>{
        function flushExit(reason: 'pagehide' | 'visibilitychange'){
            const currentPageId = prevPageIdRef.current; 
            if(!currentPageId) return; 

            const msOnPage = Date.now() - pageEnterTsRef.current; 

            track('page_exit', {
                from: currentPageId,
                msOnPage,
                reason,
            });
        }

        function onPageHide(){
            flushExit('pagehide');
        }

        function onVisibilityChange(){
            if(document.visibilityState === 'hidden'){
                flushExit('visibilitychange');
            }
        }

        window.addEventListener('pagehide', onPageHide);
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            window.removeEventListener('pagehide', onPageHide);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, []);


    useEffect(()=>{
        let mounted = true;
        fetchFlow(variant).then((f)=>{
            if(!mounted) return; 
            setFlow(f);
            setPageIndex(0);
            setForm({});
            setErrors({});
        });
        return () =>{
            mounted = false;
        };
    }, [variant]);

    useEffect(()=>{
        if(!effectivePageId) return;

        track('page_view', {
            pageId: effectivePageId,
        });
    }, [effectivePageId]);

    function onFieldChange(name: keyof FormState, value: string){
        setForm((prev) => ({...prev, [name]: value}));
        setErrors((prev) => ({...prev, [name]: undefined}));
        track('field_change', {name});
    }

    function onAction(action: 'NEXT' | 'SUBMIT'){
        if (!page) return;

        const newErrors = validatePage(page, form);
        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(Boolean);

        const errorFields = Object.entries(newErrors)
        .filter(([, v]) => Boolean(v))
        .map(([k]) => k);

        if (errorFields.length) {
        track('validation_error', {
            fields: errorFields,
        });
        }

        track('action', {action, pageId: effectivePageId, hasErrors});

        if(hasErrors) {
            setTimeout(()=>{
                const el = document.querySelector('[aria-invalid="true"]');
                (el as HTMLElement | null)?.focus();
            }, 0);

            return;
        }

        if(action === 'NEXT'){
            setPageIndex((i) => Math.min(i + 1, (flow?.pages.length ?? 1) - 1));
        }

        if(action === 'SUBMIT'){
            track('flow_complete', {
                finalPageId: page.id,
            })
            setIsSubmitted(true);
        }
    }

    if(isSubmitted){
        return(
            <div style={{padding: 24, maxWidth: 560, margin: '0 auto'}}>
                <h1 style={{marginTop: 0}}>Success!</h1>
                <p style={{opacity: 0.85}}>
                    Thanks for signing up! 
                </p>

                <div style={{marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 12}}>
                    <div><strong>Plan:</strong>{form.plan}</div>
                    <div><strong>Email:</strong>{form.email}</div>
                </div>

                <button
                    style={{marginTop: 16, padding: '10px 14px', borderRadius: 10, cursor: 'pointer'}}
                    onClick={()=>{
                        setIsSubmitted(false);
                        setForm({});
                        setErrors({});
                        setPageIndex(0);
                    }}>
                        Start over
                </button>
            </div>
        )
    }

    if(!flow || !page) return <div style={{padding: 24}}>Loading flow...</div>;

    const hasAnyErrors = Object.values(errors).some(Boolean);

    return (
        <div style={{padding: 24, maxWidth: 560, margin: '0 auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1 style={{margin: 0}}>{page.title}</h1>
            </div>

            {hasAnyErrors && (
                    <div
                    role="alert"
                    style={{
                        marginTop: 12,
                        padding: 12,
                        border: '1px solid #ddd',
                        borderRadius: 12,
                    }}
                    >
                        Please fix the highlighted fields.
                    </div>
                )}

            <div style={{marginTop: 16}}>
                {page.components.map((c) =>
                renderComponent(c, {
                    form,
                    errors,
                    onFieldChange,
                    onAction,
                })
                )}
            </div>
        </div>
    )
}