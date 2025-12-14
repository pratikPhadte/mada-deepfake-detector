import { useState } from 'react';
import { motion } from 'framer-motion';

const codeExamples = {
  curl: `curl -X POST "https://api.mada.ai/v1/detect" \\
  -H "X-API-Key: your_api_key" \\
  -F "file=@image.jpg"`,

  python: `import requests

response = requests.post(
    "https://api.mada.ai/v1/detect",
    headers={"X-API-Key": "your_api_key"},
    files={"file": open("image.jpg", "rb")}
)

result = response.json()
print(f"Is fake: {result['result']['is_fake']}")
print(f"Confidence: {result['result']['confidence']}")`,

  javascript: `const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('https://api.mada.ai/v1/detect', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key',
  },
  body: formData,
});

const result = await response.json();
console.log(\`Is fake: \${result.result.is_fake}\`);
console.log(\`Confidence: \${result.result.confidence}\`);`,
};

type Language = keyof typeof codeExamples;

export function CodeExample() {
  const [language, setLanguage] = useState<Language>('python');

  return (
    <section className="py-24 bg-mada-dark border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white uppercase tracking-wide">
            Integration
          </h2>
          <p className="mt-4 text-lg text-mada-gray-500">
            Simple REST API with SDKs for your favorite language
          </p>
        </div>

        <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
          {/* Language tabs */}
          <div className="flex border-b border-white/10">
            {(Object.keys(codeExamples) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`
                  px-6 py-3 text-sm font-medium transition-colors uppercase tracking-wider
                  ${language === lang
                    ? 'text-white bg-white/10 border-b-2 border-mada-red'
                    : 'text-mada-gray-500 hover:text-white'
                  }
                `}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Code */}
          <motion.div
            key={language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6"
          >
            <pre className="text-sm text-mada-gray-500 font-mono overflow-x-auto">
              <code>{codeExamples[language]}</code>
            </pre>
          </motion.div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/docs"
            className="inline-flex items-center gap-2 text-mada-gray-500 hover:text-white transition-colors uppercase tracking-wider text-sm"
          >
            View full documentation
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
