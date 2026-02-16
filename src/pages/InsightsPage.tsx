import {useEffect, useState} from 'react';

export default function InsightsPage(){
    const [events, setEvents] = useState<any[]>([]);

    useEffect(()=>{
        fetch('http://localhost:4000/events')
        .then((r)=> r.json())
        .then((data)=> setEvents(data.events));
    }, []);

    const exits = events.filter((e) => e.event === 'page_exit');

    const pageExits = exits.reduce((acc, e) => {
        acc[e.from] = (acc[e.from] ?? 0) + 1;
        return acc; 
    }, {} as Record<string, number>);

    const byUser = new Map<string, any[]>();
    for(const e of events){
        const id = e.userId ?? 'unknown';
        const arr = byUser.get(id) ?? [];
        arr.push(e);
        byUser.set(id, arr);
    }

    for(const [id, arr] of byUser.entries()){
        arr.sort((a, b)=> new Date(a.ts).getTime() - new Date(b.ts).getTime());
    }

    let abandons = 0; 
    const abandonByPage: Record<string, number> = {};

    for(const [, arr] of byUser.entries()){
        const completed = arr.some((e) => e.event === 'flow_complete');
        if(completed) continue;

        const last = arr[arr.length - 1];
        const isUnloadExit = 
            last?.event === 'page_exit' && (last?.reason === 'pagehide' || last?.reason === 'visibilitychange');

            if(isUnloadExit){
                abandons += 1; 
                const page = last.from ?? 'unknown';
                abandonByPage[page] = (abandonByPage[page] ?? 0) + 1;
            }
    }

    return (
        <div style={{padding: 24}}>
            <h1>Flow Insights</h1>

            <h2>Exits / Transitions</h2>
            <pre>{JSON.stringify(pageExits, null, 2)}</pre>

            <h2>True Abandonment</h2>
            <div><strong>Total abandons:</strong> {abandons}</div>
            <pre>{JSON.stringify(abandonByPage, null, 2)}</pre>

            <h2>Raw Events</h2>
            <pre
                style={{
                background: '#111',
                color: '#0f0',
                padding: 12,
                borderRadius: 12,
                }}
            >{JSON.stringify(events, null, 2)}</pre>
        </div>
    )
}