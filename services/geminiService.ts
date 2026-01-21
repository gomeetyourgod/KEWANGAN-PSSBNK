
import { GoogleGenAI, Type } from "@google/genai";
import { Member, PaymentRecord, Transaction } from "../types";
import { MONTHS } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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
      return "Gagal menjana laporan AI. Sila cuba lagi.";
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
      return "Gagal menjana laporan tahunan. Pastikan anda mempunyai rekod transaksi.";
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
