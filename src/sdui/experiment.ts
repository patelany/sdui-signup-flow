export function bucket(userId: string): 'A' | 'B'{
    let hash = 0; 

    for (let i = 0; i < userId.length; i++){
        hash = (hash * 31 + userId.charCodeAt(i)) >>> 0; 
    }

    return hash % 2 === 0 ? 'A' : 'B';
}