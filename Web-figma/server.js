import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';

const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' }));

app.post('/extract', async (req, res) => {
    const { url, depth = 'balanced', mode = 'desktop' } = req.body;
    if (!url) return res.status(400).send('Missing URL');

    const viewport = mode === 'mobile' ? { width: 375, height: 812 } : { width: 1280, height: 900 };
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport });

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });

        const tree = await page.evaluate(() => {
            const parseElement = (el) => {
                const cs = getComputedStyle(el);
                const box = el.getBoundingClientRect();

                const node = {
                    tag: el.tagName.toLowerCase(),
                    text: el.textContent.trim() || null,
                    style: {
                        color: cs.color,
                        background: cs.backgroundColor,
                        fontSize: cs.fontSize,
                        fontWeight: cs.fontWeight,
                        borderRadius: cs.borderRadius,
                    },
                    box: { width: box.width, height: box.height },
                    children: [],
                };

                for (const child of el.children) node.children.push(parseElement(child));
                return node;
            };

            return { meta: { title: document.title }, root: parseElement(document.body) };
        });

        res.setHeader('Content-Disposition', 'attachment; filename=\"web_to_figma.fig.json\"');
        res.json(tree);
    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        await browser.close();
    }
});

const PORT = 8787;
app.listen(PORT, () => console.log(`Extractor corriendo en http://localhost:${PORT}`));