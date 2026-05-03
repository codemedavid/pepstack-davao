import React from 'react';
import { Shield, ExternalLink, ArrowLeft, Sparkles } from 'lucide-react';
import { useCOAPageSetting } from '../hooks/useCOAPageSetting';

const COA_CANVA_URL =
  'https://www.canva.com/design/DAHEeZbx5CI/yxEaHB6aFofruFB_bX1FWQ/view?utm_content=DAHEeZbx5CI&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h31a49b193c';

const COA: React.FC = () => {
  const { coaPageEnabled, loading: settingLoading } = useCOAPageSetting();

  if (settingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!coaPageEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Lab Reports Unavailable</h1>
          <p className="text-gray-600 mb-6">The COA page is currently disabled.</p>
          <a href="/" className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100/50 to-rose-50 flex flex-col">
      <a
        href="/"
        className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-md border border-pink-200 text-gray-700 hover:text-pink-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </a>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-cute border-2 border-pink-100 p-8 md:p-10 text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-full border-2 border-pink-200 mb-6">
            <Shield className="w-4 h-4 text-pink-500" />
            <span className="text-xs md:text-sm font-bold text-pink-600">Lab Verified</span>
          </div>

          <h1 className="font-outfit text-3xl md:text-4xl font-bold mb-3 text-gray-800">
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Lab Reports
            </span>
            <Sparkles className="inline-block w-6 h-6 md:w-7 md:h-7 text-pink-400 ml-2 mb-1 animate-pulse" />
          </h1>

          <p className="text-sm md:text-base text-pink-600 mb-8">
            View our complete Certificate of Analysis collection on Canva.
          </p>

          <a
            href={COA_CANVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            View Lab Reports
          </a>
        </div>
      </div>
    </div>
  );
};

export default COA;
