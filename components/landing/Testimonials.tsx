'use client'

const testimonials = [
  {
    quote: "We plugged in the SDK on a Friday and by Monday our GPT-4 bill dropped 62%. The model swap recommendations paid for Pro in the first hour.",
    author: 'Sarah Chen',
    role: 'CTO',
    company: 'TechFlow',
    savings: '62%',
  },
  {
    quote: "We were burning $18k/month on AI with zero visibility. Optim showed us 40% of calls could use a cheaper model with no quality loss.",
    author: 'Marcus Johnson',
    role: 'Head of Engineering',
    company: 'DataSense AI',
    savings: '45%',
  },
  {
    quote: "Smart routing cut our p95 latency by 40% and reduced costs at the same time. Setup was literally two lines of code.",
    author: 'Emily Rodriguez',
    role: 'Lead Developer',
    company: 'AppCraft',
    savings: '40%',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 sm:py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Teams ship faster and spend less
          </h2>
          <p className="text-base sm:text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            Engineering teams use Optim to cut AI costs without sacrificing quality or speed.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bento-card">
              {/* Savings badge - constructivist style */}
              <div className="inline-block px-3 py-1 bg-[var(--accent)] text-white text-sm font-bold rounded mb-4">
                {testimonial.savings} SAVED
              </div>

              {/* Quote */}
              <blockquote className="text-base sm:text-lg mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center">
                  <span className="text-xl font-display font-bold text-[var(--accent)]">
                    {testimonial.author[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
