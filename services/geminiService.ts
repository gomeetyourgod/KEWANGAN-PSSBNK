
import { GoogleGenAI, Type } from "@google/genai";
import { Member, PaymentRecord, Transaction } from "../types";
import { MONTHS } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Vite menggunakan import.meta.env manakala persekitaran lain mungkin menggunakan process.env
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateFinancialReport(members: Member[], payments: PaymentRecord[], transactions: Transaction[]) {
    const totalIn = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIn - totalOut;

    const prompt = `
      Anda adalah pengurus kewangan strategik untuk kelab silat. 
      Sila berikan analisis kewangan profesional berdasarkan data berikut:
      - Jumlah Ahli: ${members.length}
      - Jumlah Pendapatan Keseluruhan: RM${totalIn}
      - Jumlah Perbelanjaan Keseluruhan: RM${totalOut}
      - Baki Tunai Semasa: RM${balance}
      
      Sila berikan rumusan dalam Bahasa Melayu yang merangkumi:
      1. Kesihatan kewangan kelab.
      2. Cadangan penjimatan atau pelaburan.
      3. Strategi untuk menarik lebih banyak sumbangan luar.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Gagal menjana laporan AI. Sila semak API Key anda.";
    }
  }

  async generateAnnualReport(transactions: Transaction[]) {
    const currentYear = new Date().getFullYear();
    const annualTransactions = transactions.filter(t => new Date(t.date).getFullYear() === currentYear);
    const totalIn = annualTransactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
    const totalOut = annualTransactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIn - totalOut;

    const prompt = `
      Hasilkan satu Laporan Kewangan Tahunan Ringkas (${currentYear}) untuk kelab silat dalam Bahasa Melayu.
      Data Transaksi:
      - Jumlah Pendapatan (Duit Masuk): RM${totalIn}
      - Jumlah Perbelanjaan (Duit Keluar): RM${totalOut}
      - Baki Akhir Tahun: RM${balance}
      
      Sila berikan ulasan ringkas (bullet points) mengenai:
      - Aliran tunai tahunan.
      - Perbandingan antara pendapatan dan perbelanjaan.
      - Nasihat untuk pengurusan kewangan tahun depan.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Gagal menjana laporan tahunan.";
    }
  }

  async generateCashFlowStatement(transactions: Transaction[]) {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dataString = sortedTransactions.map(t => `${t.date}: [${t.type}] ${t.category} - RM${t.amount} (${t.description})`).join('\n');

    const prompt = `
      Hasilkan satu Penyata Aliran Tunai (Cash Flow Statement) yang profesional untuk persatuan silat dalam Bahasa Melayu.
      Gunakan data transaksi mentah berikut:
      ${dataString}

      Format penyata mestilah mengandungi:
      1. Tajuk: PENYATA ALIRAN TUNAI PERSATUAN SILAT.
      2. Ringkasan Penerimaan (Inflows) mengikut kategori.
      3. Ringkasan Pembayaran (Outflows) mengikut kategori.
      4. Aliran Tunai Bersih (Net Cash Flow).
      5. Analisis Ringkas: Berikan komen tentang kecairan (liquidity) persatuan dan trend perbelanjaan utama.
      
      Pastikan nada laporan adalah formal dan profesional.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Gagal menjana Penyata Aliran Tunai.";
    }
  }

  async generateReminderMessage(memberName: string, month: string) {
    const prompt = `
      Hasilkan satu mesej WhatsApp yang sopan dan ramah dalam Bahasa Melayu untuk mengingatkan ahli silat bernama ${memberName} mengenai pembayaran yuran bulan ${month} yang belum dijelaskan.
      Pastikan mesej itu menunjukkan semangat persaudaraan silat.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return `Salam Saudara/Saudari ${memberName}, sekadar peringatan mesra untuk yuran bulan ${month}. Terima kasih.`;
    }
  }
}

export const geminiService = new GeminiService();
