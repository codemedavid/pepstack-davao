import React, { useState } from 'react';
import { ArrowLeft, FlaskConical, Syringe, Thermometer, Clock, ChevronRight, BookOpen } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { useCart } from '../hooks/useCart';
import { useProtocols } from '../hooks/useProtocols';

const ProtocolGuide: React.FC = () => {
    const { cartItems } = useCart();
    const { protocols, loading } = useProtocols();
    const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);

    const handleBackToHome = () => {
        window.location.href = '/';
    };

    const activeProtocols = protocols.filter(p => p.active);

    // Group by category, preserving first-seen order
    const groupedProtocols = activeProtocols.reduce<Record<string, typeof activeProtocols>>((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p);
        return acc;
    }, {});
    const categoryOrder = Array.from(new Set(activeProtocols.map(p => p.category)));

    const selectedProtocol = activeProtocols.find(p => p.id === selectedProtocolId) || null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FADADD] via-[#FDF5F7] to-white">
            <Header
                cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                onCartClick={() => { }}
                onMenuClick={handleBackToHome}
            />

            <main className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Back Button */}
                <button
                    onClick={selectedProtocol ? () => setSelectedProtocolId(null) : handleBackToHome}
                    className="flex items-center gap-2 text-charcoal-600 hover:text-brand-800 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">
                        {selectedProtocol ? 'Back to Protocols' : 'Back to Home'}
                    </span>
                </button>

                {/* Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-brand-200 shadow-soft mb-4">
                        <BookOpen className="w-4 h-4 text-brand-800" />
                        <span className="text-xs font-medium text-charcoal-700 uppercase tracking-widest">Protocol Guide</span>
                    </div>
                    <h1 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal-900 mb-3">
                        {selectedProtocol ? selectedProtocol.name : 'Peptide Protocol Guide'}
                    </h1>
                    {!selectedProtocol && (
                        <p className="text-charcoal-600 max-w-2xl mx-auto text-sm">
                            General dosage guidelines and protocols for peptides. Always consult with a healthcare professional before use.
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
                    </div>
                ) : selectedProtocol ? (
                    <ProtocolDetail protocol={selectedProtocol} />
                ) : (
                    <div className="space-y-6">
                        {categoryOrder.map((category) => (
                            <div
                                key={category}
                                className="bg-white rounded-2xl shadow-soft border border-brand-100 overflow-hidden"
                            >
                                <div className="px-5 py-4 border-b border-brand-100">
                                    <h2 className="text-sm font-bold text-brand-800 uppercase tracking-widest">
                                        {category}
                                    </h2>
                                </div>
                                <ul className="divide-y divide-brand-100">
                                    {groupedProtocols[category].map((p) => (
                                        <li key={p.id}>
                                            <button
                                                onClick={() => setSelectedProtocolId(p.id)}
                                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-50/60 transition-colors"
                                            >
                                                <span className="text-charcoal-900 font-medium">{p.name}</span>
                                                <ChevronRight className="w-5 h-5 text-charcoal-400 flex-shrink-0" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {activeProtocols.length === 0 && (
                            <div className="bg-white rounded-2xl shadow-soft border border-brand-100 p-8 text-center">
                                <p className="text-charcoal-500">No protocols available.</p>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="text-center pt-4">
                            <a
                                href="/calculator"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-800 hover:bg-brand-900 text-white font-semibold rounded-2xl shadow-lg transition-all"
                            >
                                <FlaskConical className="w-4 h-4" />
                                Use Peptide Calculator
                            </a>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

type Protocol = {
    id: string;
    name: string;
    category: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string[];
    storage?: string;
};

const SectionBar: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-brand-800 rounded-xl px-5 py-3 mb-3">
        <h2 className="text-white font-bold text-sm sm:text-base uppercase tracking-wider">{title}</h2>
    </div>
);

const ProtocolDetail: React.FC<{ protocol: Protocol }> = ({ protocol }) => {
    return (
        <div className="space-y-6">
            {/* Reconstitution Guide */}
            <section>
                <SectionBar title="Reconstitution Guide" />
                <div className="bg-white rounded-2xl border border-brand-100 shadow-soft overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-brand-100">
                            <tr>
                                <td className="px-4 py-3 font-semibold text-brand-800 w-1/3 align-top">15mg vial</td>
                                <td className="px-4 py-3 text-charcoal-700">Add 1.5ml Bacteriostatic Water → 10mg/ml</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-semibold text-brand-800 align-top">20mg vial</td>
                                <td className="px-4 py-3 text-charcoal-700">Add 2ml Bacteriostatic Water → 10mg/ml</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-semibold text-brand-800 align-top">30mg vial</td>
                                <td className="px-4 py-3 text-charcoal-700">Add 3ml Bacteriostatic Water → 10mg/ml</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-semibold text-brand-800 align-top">Tip</td>
                                <td className="px-4 py-3 text-charcoal-700">
                                    You can use less BAC water (e.g. 1.2ml for 15mg). Less BAC water doesn't mean a lesser dose — you just inject a smaller volume of the same concentration.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Dosage Table */}
            <section>
                <SectionBar title="Dosage Table" />
                <div className="bg-white rounded-2xl border border-brand-100 shadow-soft overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-brand-700 text-white">
                                <th className="px-3 py-3 text-left font-semibold">Weekly Dose</th>
                                <th className="px-3 py-3 text-left font-semibold">Units<br/>(15mg/1.5ml)</th>
                                <th className="px-3 py-3 text-left font-semibold">Units<br/>(20mg/2ml)</th>
                                <th className="px-3 py-3 text-left font-semibold">Units<br/>(30mg/3ml)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-100">
                            {[
                                ['2.5mg', '25 units'],
                                ['5mg', '50 units'],
                                ['7.5mg', '75 units'],
                                ['10mg', '100 units'],
                                ['12.5mg', '125 units'],
                                ['15mg (max)', '150 units'],
                            ].map(([dose, units]) => (
                                <tr key={dose}>
                                    <td className="px-3 py-3 font-medium text-charcoal-800">{dose}</td>
                                    <td className="px-3 py-3 text-charcoal-700">{units}</td>
                                    <td className="px-3 py-3 text-charcoal-700">{units}</td>
                                    <td className="px-3 py-3 text-charcoal-700">{units}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-charcoal-500 mt-2 italic">
                    *All three vial sizes reconstituted at 10mg/ml yield the same unit measurements per dose.*
                </p>
            </section>

            {/* If using 1.2ml */}
            <section>
                <SectionBar title="If using 1.2ml BAC water instead" />
                <p className="text-sm text-charcoal-700 mb-3">
                    Some prefer 1.2ml for a smaller injection volume. Units differ per vial size at this concentration:
                </p>
                <div className="bg-white rounded-2xl border border-brand-100 shadow-soft overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-brand-700 text-white">
                                <th className="px-3 py-3 text-left font-semibold">Weekly Dose</th>
                                <th className="px-3 py-3 text-left font-semibold">15mg<br/>(1.2ml)</th>
                                <th className="px-3 py-3 text-left font-semibold">20mg<br/>(1.2ml)</th>
                                <th className="px-3 py-3 text-left font-semibold">30mg<br/>(1.2ml)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-100">
                            {[
                                ['2.5mg', '20 units', '15 units', '10 units'],
                                ['5mg', '40 units', '30 units', '20 units'],
                                ['7.5mg', '60 units', '45 units', '30 units'],
                                ['10mg', '80 units', '60 units', '40 units'],
                                ['12.5mg', '100 units', '75 units', '50 units'],
                                ['15mg (max)', '120 units', '90 units', '60 units'],
                            ].map(([dose, a, b, c]) => (
                                <tr key={dose}>
                                    <td className="px-3 py-3 font-medium text-charcoal-800">{dose}</td>
                                    <td className="px-3 py-3 text-charcoal-700">{a}</td>
                                    <td className="px-3 py-3 text-charcoal-700">{b}</td>
                                    <td className="px-3 py-3 text-charcoal-700">{c}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Sample Titration / Protocol-specific info */}
            <section>
                <SectionBar title="Sample Titration Plan" />
                <div className="bg-white rounded-2xl border border-brand-100 shadow-soft overflow-hidden">
                    <div className="grid grid-cols-3 gap-px bg-brand-100">
                        <div className="bg-brand-50 px-3 py-3">
                            <p className="text-xs uppercase tracking-wider text-charcoal-500">Dosage</p>
                            <p className="text-sm font-semibold text-charcoal-900 mt-1">{protocol.dosage}</p>
                        </div>
                        <div className="bg-brand-50 px-3 py-3">
                            <p className="text-xs uppercase tracking-wider text-charcoal-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Frequency
                            </p>
                            <p className="text-sm font-semibold text-charcoal-900 mt-1">{protocol.frequency}</p>
                        </div>
                        <div className="bg-brand-50 px-3 py-3">
                            <p className="text-xs uppercase tracking-wider text-charcoal-500">Duration</p>
                            <p className="text-sm font-semibold text-charcoal-900 mt-1">{protocol.duration}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Notes */}
            {protocol.notes && protocol.notes.length > 0 && (
                <section>
                    <SectionBar title="Protocol Notes" />
                    <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5">
                        <ul className="space-y-2">
                            {protocol.notes.map((note, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-charcoal-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-700 mt-2 flex-shrink-0"></span>
                                    {note}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* Storage */}
            {protocol.storage && (
                <section>
                    <SectionBar title="Storage" />
                    <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5">
                        <p className="text-sm text-charcoal-700 flex items-start gap-2">
                            <Thermometer className="w-4 h-4 text-brand-800 mt-0.5 flex-shrink-0" />
                            {protocol.storage}
                        </p>
                    </div>
                </section>
            )}

            {/* General Injection Guidelines */}
            <section>
                <SectionBar title="General Injection Guidelines" />
                <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5">
                    <ul className="space-y-3 text-sm text-charcoal-700">
                        <li className="flex items-start gap-2">
                            <Syringe className="w-4 h-4 text-brand-800 mt-0.5 flex-shrink-0" />
                            <span><strong>Reconstitution:</strong> Use bacteriostatic water. Add slowly along the vial wall, don't shake.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Syringe className="w-4 h-4 text-brand-800 mt-0.5 flex-shrink-0" />
                            <span><strong>Injection sites:</strong> Rotate between abdomen, thigh, and upper arm.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Syringe className="w-4 h-4 text-brand-800 mt-0.5 flex-shrink-0" />
                            <span><strong>Needle size:</strong> 29-31 gauge insulin syringes for subcutaneous injections.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Syringe className="w-4 h-4 text-brand-800 mt-0.5 flex-shrink-0" />
                            <span><strong>Timing:</strong> Most peptides are best taken on an empty stomach or before bed.</span>
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default ProtocolGuide;
