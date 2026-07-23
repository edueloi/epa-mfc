import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, Share2, Download, ExternalLink, X, Smartphone, Heart } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Determine current public URL for the survey form
  const surveyUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?tab=survey` 
    : 'https://5epa-pirassununga.mfc.org.br';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `👋 Olá! Responda aqui a *Pesquisa de Satisfação & Avaliação das Oficinas* do *5º EPA Pirassununga - Movimento Familiar Cristão*:\n\n👉 ${surveyUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-inner">
            <QrCode className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">QR Code da Pesquisa EPA</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Aponte a câmera do celular para responder diretamente ao formulário de avaliação do evento.
          </p>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="bg-slate-50 border-2 border-dashed border-teal-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm">
          <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
            <QRCodeSVG 
              value={surveyUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-teal-800 font-bold bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>5º EPA Pirassununga - MFC</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCopyLink}
            className="w-full py-3 px-4 bg-slate-900 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Link Copiado para a Área de Transferência!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-teal-400" />
                <span>Copiar Link do Formulário</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-4 bg-emerald-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
          >
            <Smartphone className="w-4 h-4" />
            <span>Enviar no Grupo do WhatsApp</span>
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400 italic">
          Os participantes não precisam fazer login para responder. O formulário é totalmente público e anônimo.
        </p>

      </div>
    </div>
  );
};
