// app/about-us/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Target, Users, TrendingUp, Shield, Award, BarChart3, PieChart, LineChart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Share Target Price',
  description: 'Learn about Share Target Price – India\'s trusted platform for stock price targets, mutual fund analysis, SIP calculators, and investment insights.',
  keywords: 'about us, share target price, stock analysis, mutual fund research, investment platform',
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
        
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">About Share Target Price</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            India's #1 platform for stock price targets, mutual fund analysis, and AI-powered investment insights.
          </p>
        </div>

        <div className="space-y-12">
          
          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-10 h-10 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  To empower Indian retail investors with accurate, transparent, and easy-to-understand stock 
                  and mutual fund analysis. We believe that informed investors make better financial decisions. 
                  By combining AI technology with quality data, we help you navigate the complex world of investing.
                </p>
              </div>
            </div>
          </div>

          {/* What We Offer */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">What We Offer</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-md transition">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Stock Price Targets</h3>
                <p className="text-gray-500 text-sm">Long-term price targets for 500+ stocks, updated regularly with AI analysis.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-md transition">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PieChart className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Mutual Fund Reviews</h3>
                <p className="text-gray-500 text-sm">In-depth analysis of 500+ mutual funds across all categories – Large Cap, Mid Cap, Small Cap, ELSS, and more.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-md transition">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Comparison Tools</h3>
                <p className="text-gray-500 text-sm">Side-by-side comparison of 5000+ fund pairs – returns, risk, expenses, and holdings.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-md transition">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LineChart className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Interactive SIP Calculator</h3>
                <p className="text-gray-500 text-sm">Plan your investments with our step‑up SIP calculators and scenario analysis.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-md transition">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Risk & Diversification</h3>
                <p className="text-gray-500 text-sm">Riskometer, volatility, Sharpe ratio, and portfolio insights for smarter investing.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-md transition">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Educational Content</h3>
                <p className="text-gray-500 text-sm">Market insights, IPO analysis, and financial literacy resources.</p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Choose Share Target Price?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
                <p className="text-gray-600 text-sm">Mutual Funds Analyzed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
                <p className="text-gray-600 text-sm">Stocks with Price Targets</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">5,000+</div>
                <p className="text-gray-600 text-sm">Fund Comparison Pages</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">AI‑Powered</div>
                <p className="text-gray-600 text-sm">Analysis & Content Generation</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">₹0</div>
                <p className="text-gray-600 text-sm">Completely Free to Use</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <p className="text-gray-600 text-sm">Access from anywhere</p>
              </div>
            </div>
          </div>

          {/* Our Team */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Meet the Team</h2>
            <p className="text-gray-600 mb-6">
              Share Target Price was founded by Mahendra Maurya, a seasoned Relationship Manager with 6+ years 
              of experience in banking and financial services. Our team is passionate about democratizing 
              investment research for every Indian investor.
            </p>
            <div className="inline-flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-600">MM</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Mahendra Maurya</h3>
                <p className="text-gray-500 text-sm">Founder & Lead Analyst</p>
                <p className="text-gray-500 text-sm">Relationship Manager, 6+ years experience</p>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed text-center max-w-3xl mx-auto">
              To become India's most trusted, transparent, and accessible investment research platform. 
              We aim to empower 10 million+ investors with AI-driven insights, helping them build long-term 
              wealth through informed decision-making.
            </p>
          </div>

          {/* Disclaimer Note */}
          <div className="text-center text-sm text-gray-400">
            <p>Share Target Price is an independent research platform. We are not a SEBI-registered advisor.</p>
            <p>For investment decisions, please consult your financial advisor.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
