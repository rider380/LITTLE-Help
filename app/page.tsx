const categories = [
  {
    icon: "🍲",
    title: "Food & Essentials",
    description: "Help someone get their daily necessities.",
  },
  {
    icon: "🏥",
    title: "Medical Support",
    description: "Support people who need medical assistance.",
  },
  {
    icon: "📚",
    title: "Education",
    description: "Help children access learning opportunities.",
  },
  {
    icon: "🏠",
    title: "Shelter & Housing",
    description: "Help families find a safe place to live.",
  },
  {
    icon: "👕",
    title: "Clothing",
    description: "Share clothes with people who need them.",
  },
  {
    icon: "🤝",
    title: "Other Needs",
    description: "Make a difference in someone's life.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="#" className="text-2xl font-bold tracking-tight text-emerald-700">
            Little<span className="text-gray-900">Help.</span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#about" className="hover:text-emerald-700">About Us</a>
            <a href="#categories" className="hover:text-emerald-700">Categories</a>
            <a href="#how-it-works" className="hover:text-emerald-700">How It Works</a>
            <a href="#contact" className="hover:text-emerald-700">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="/login" className="hidden text-sm font-semibold sm:block">
              Login
            </a>
            <a
              href="/register"
              className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Join Us
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-orange-50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
          <div>
            <span className="inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
              ❤️ Small Help. Big Difference.
            </span>

            <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Together, We Can
              <span className="block text-emerald-700">Change Lives.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
              A little help from you can bring a big smile to someone.
              Connect with people in need and make kindness reach everywhere.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="/register"
                className="rounded-full bg-emerald-700 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800"
              >
                Start Helping →
              </a>

              <a
                href="#about"
                className="rounded-full border border-gray-300 px-8 py-4 font-semibold hover:bg-white"
              >
                Learn More
              </a>
            </div>

            <p className="mt-8 text-sm text-gray-500">
              Every act of kindness matters. Every person matters.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] bg-emerald-100 p-8 md:p-12">
              <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
                <div className="text-8xl">🤲</div>
                <h2 className="mt-6 text-3xl font-bold">Be Someone's Hope</h2>
                <p className="mt-3 leading-7 text-gray-600">
                  Your kindness can make someone's difficult day a little
                  brighter.
                </p>
                <div className="mt-8 rounded-2xl bg-orange-50 p-5">
                  <p className="text-2xl font-bold text-emerald-800">
                    Give Hope. Share Love.
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Together, we are stronger.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-semibold uppercase tracking-widest text-emerald-700">
            About Little Help
          </p>
          <h2 className="mt-4 text-4xl font-bold">
            Kindness Has The Power To Change Lives
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Little Help is a platform built to connect people who need help
            with people who are willing to help. We believe that no act of
            kindness is ever too small.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="font-semibold uppercase tracking-widest text-emerald-700">
              Ways To Help
            </p>
            <h2 className="mt-4 text-4xl font-bold">
              Choose How You Want To Make A Difference
            </h2>
            <p className="mt-5 text-gray-600">
              Every little contribution can create a better tomorrow.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.title}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-5xl">{category.icon}</div>
                <h3 className="mt-6 text-xl font-bold">{category.title}</h3>
                <p className="mt-3 leading-7 text-gray-600">
                  {category.description}
                </p>
                <a
                  href="/register"
                  className="mt-6 inline-block font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Help Now →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-widest text-emerald-700">
            Simple Process
          </p>
          <h2 className="mt-4 text-4xl font-bold">How Little Help Works</h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Create An Account",
              description: "Register and become part of our helping community.",
            },
            {
              number: "02",
              title: "Find A Need",
              description: "Explore requests from people who need support.",
            },
            {
              number: "03",
              title: "Make A Difference",
              description: "Offer support and bring hope to someone's life.",
            },
          ].map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-800">
                {step.number}
              </div>
              <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
              <p className="mt-3 leading-7 text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-emerald-800 px-8 py-16 text-center text-white md:px-16">
          <h2 className="text-4xl font-bold">
            Be The Reason Someone Smiles Today.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-emerald-100">
            Join Little Help and become part of a community where people care,
            share, and support one another.
          </p>
          <a
            href="/register"
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-bold text-emerald-800 hover:bg-emerald-50"
          >
            Join Little Help Today →
          </a>
        </div>
      </section>

      {/* Contact */}
      <footer id="contact" className="border-t border-gray-100 bg-gray-950 px-6 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row">
          <div>
            <h2 className="text-3xl font-bold">
              Little<span className="text-emerald-400">Help.</span>
            </h2>
            <p className="mt-3 max-w-sm leading-7 text-gray-400">
              Together, we can make the world a kinder place.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Contact Us</h3>
            <p className="mt-3 text-gray-400">
              Email: support@littlehelp.org
            </p>
            <p className="mt-2 text-gray-400">
              We are here to make helping easier.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © 2026 Little Help. All rights reserved.
        </div>
      </footer>
    </main>
  );
}