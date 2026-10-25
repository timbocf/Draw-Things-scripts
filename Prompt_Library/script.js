
import { createClient } from
    'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    'https://bfyboblodnntlmvummuu.supabase.co',
    'sb_publishable_sAkgefjZQYfOSjnJvzj56g_fRrsuOts'
);


async function savePrompt(title, prompt) {
    const { data, error } = await supabase
        .from('prompts')
        .insert({ title, prompt })
        .select();

    if (error) {
        console.error(error.message);
        return;
    }

    return data;
}


async function getPrompts() {
    const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
}
