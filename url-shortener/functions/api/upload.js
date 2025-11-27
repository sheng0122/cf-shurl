/**
 * POST /api/upload
 * Uploads an image to R2 and returns the public URL.
 */
export async function onRequestPost({ request, env }) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // Validate File Type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return Response.json({ success: false, error: 'Invalid file type' }, { status: 400 });
        }

        // Validate File Size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return Response.json({ success: false, error: 'File too large (max 5MB)' }, { status: 400 });
        }

        // Generate unique filename
        const ext = file.name.split('.').pop();
        const filename = `og/${Date.now()}-${crypto.randomUUID()}.${ext}`;

        // Upload to R2
        await env.IMAGES.put(filename, file.stream(), {
            httpMetadata: { contentType: file.type }
        });

        // Construct Public URL
        // Note: User must configure a custom domain for R2 or use r2.dev and set it in env
        // For now, we assume a standard R2 public bucket URL structure or env var
        const r2Domain = env.R2_DOMAIN || 'https://pub-xxxxxxxx.r2.dev'; // Placeholder
        const publicUrl = `${r2Domain}/${filename}`;

        return Response.json({ success: true, data: { url: publicUrl, filename } });
    } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
    }
}
