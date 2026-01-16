const fs = require('fs');
const path = require('path');

const dir = 'components';

fs.readdir(dir, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
        if (!file.endsWith('.tsx')) return;

        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Check what hooks are used
        const hasNavigate = content.includes('useNavigate');
        const hasParams = content.includes('useParams');
        const hasLocation = content.includes('useLocation');

        if (!hasNavigate && !hasParams && !hasLocation) return;

        // Build expo-router import
        const imports = [];
        if (hasNavigate) imports.push('useRouter');
        if (hasParams) imports.push('useLocalSearchParams');
        if (hasLocation) imports.push('usePathname');

        if (imports.length > 0) {
            if (content.includes("from 'expo-router'")) {
                // Already has expo-router, maybe just lucide-react-native fix happened
                // We might need to merge or ignore. 
                // For simplicity, let's assume we replace react-router-dom import if it exists
            } else {
                content = content.replace(
                    /import\s+{[^}]+}\s+from\s+['"]react-router-dom['"];?/,
                    `import { ${imports.join(', ')} } from 'expo-router';`
                );
            }
        }

        // Replacements
        if (hasNavigate) {
            content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\);?/g, 'const router = useRouter();');
            // Replace navigate('path') with router.push('path')
            // Handling simplest case navigate(arg) -> router.push(arg)
            content = content.replace(/navigate\(/g, 'router.push(');
        }

        if (hasParams) {
            // replace const { id } = useParams<{ id: string }>();
            // to const { id } = useLocalSearchParams<{ id: string }>();
            // Generic handling might be tricky with regex, let's try strict replacement for known pattern or generic
            content = content.replace(/useParams<[^>]+>\(\)/g, 'useLocalSearchParams()');
            content = content.replace(/useParams\(\)/g, 'useLocalSearchParams()');
        }

        if (hasLocation) {
            content = content.replace(/const\s+location\s*=\s*useLocation\(\);?/g, 'const pathname = usePathname();');
            content = content.replace(/location\.pathname/g, 'pathname');
        }

        fs.writeFileSync(filePath, content);
        console.log(`Refactored ${file}`);
    });
});
