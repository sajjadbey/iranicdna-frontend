import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Layout } from '../components/Layout';
import { VCFToPlinkConverter } from '../components/vcf/VCFToPlinkConverter';
import { slideInVariants, fadeInVariants } from '../utils/deviceDetection';

export const VCFToPlinkPage: React.FC = () => {
  return (
    <Layout>
      <motion.section
        {...slideInVariants}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <RefreshCw className="text-teal-400" size={36} />
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
              VCF to 23andMe Converter
            </h2>
            <p className="mt-2 text-teal-300/80">
              Convert your VCF file to 23andMe format using plink
            </p>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Converter Form */}
        <div className="lg:col-span-1">
          <VCFToPlinkConverter />
        </div>

        {/* Information Section */}
        <div className="lg:col-span-2">
          <motion.div
            {...fadeInVariants}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-xl p-6 bg-slate-800/60 ring-1 ring-teal-600/30"
          >
            <h3 className="text-2xl font-semibold text-teal-100 mb-4">How It Works</h3>
            
            <div className="space-y-4 text-teal-200/90">
              <div>
                <h4 className="text-lg font-semibold text-teal-100 mb-2">Supported Formats</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Plain VCF files (.vcf)</li>
                  <li>Compressed VCF files (.vcf.gz)</li>
                  <li>ZIP archives containing VCF files (.zip)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-teal-100 mb-2">Process</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Enter a sample ID (used in the output filename)</li>
                  <li>Upload your VCF file</li>
                  <li>Click "Convert & Download"</li>
                  <li>Your converted file will download automatically as {'{sample_id}_23andme.txt.gz'}</li>
                </ol>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-teal-100 mb-2">Output Format</h4>
                <p className="text-sm">
                  The converter uses plink to transform your VCF file into 23andMe format, 
                  which is compatible with various genetic analysis tools and services.
                </p>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
                <p className="text-sm text-amber-200 font-semibold mb-2">Note</p>
                <p className="text-xs text-amber-200/90">
                  Large files may take longer to process. The conversion happens on our server, 
                  so your file will be uploaded first before conversion begins.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};