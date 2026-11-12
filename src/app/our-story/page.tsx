import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import './about.css';

export const metadata: Metadata = {
  title: 'Our Story | Leaves of Kentucky',
  description:
    'Meet Elena Young, the artist who turns real Kentucky leaves and flowers into one-of-a-kind copper jewelry.',
};

export default function OurStoryPage() {
  return (
    <div className="site-wrapper">
      <Header />

      <main className="ab-main">
        {/* Hero */}
        <section className="ab-hero">
          <div className="ab-hero-copy">
            <span className="ab-eyebrow">OUR STORY</span>
            <h1 className="ab-title">Where Nature Becomes Timeless</h1>
            <p className="ab-lead">
              Every leaf has a story. Every flower holds a little magic. And sometimes, the most
              beautiful things are those we choose to preserve.
            </p>
          </div>
          <div className="ab-hero-photo">
            <Image
              src="/assets/hero.webp"
              alt="Copper leaf pendant and earrings resting on linen beside ferns"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 46vw"
            />
          </div>
        </section>

        {/* Elena */}
        <section className="ab-intro">
          <p className="ab-big">
            My name is <strong>Elena Young</strong>, and my story began far away, in Russia.
          </p>
          <p>
            Love brought me across the ocean to Kentucky, where my husband, Mark, and I found our
            home in a small, peaceful community on the shores of Kentucky Lake.
          </p>
          <p>
            Here, the forests stretch toward the water, wildflowers bloom along quiet paths, and
            every season brings a new kind of beauty.
          </p>
          <p className="ab-soft">
            It is a place where nature speaks softly — and where I learned to listen.
          </p>
        </section>

        {/* A little magic */}
        <section className="ab-split">
          <div className="ab-split-photo">
            <Image
              src="/assets/process.webp"
              alt="Hands shaping a copper leaf at the workbench"
              fill
              sizes="(max-width: 900px) 100vw, 44vw"
            />
          </div>
          <div className="ab-split-copy">
            <span className="ab-eyebrow">THE CRAFT</span>
            <h2 className="ab-h2">A Little Magic Hidden in Every Leaf</h2>
            <p>I have always believed that nature creates the most extraordinary works of art.</p>
            <p>
              Look closely at a leaf. See the delicate veins, the graceful curves, the tiny
              imperfections that make it unlike any other leaf in the world.
            </p>
            <p className="ab-emph">Nature creates each one only once.</p>
            <p>And I wanted to find a way to make that fleeting beauty last.</p>
            <p>
              As an artist, and perhaps a little bit of an alchemist, I began transforming real
              leaves, flowers, and delicate twigs into copper jewelry.
            </p>
            <p>
              With copper, beautiful stones, and a touch of color, something fragile becomes
              something you can hold, treasure, and wear close to your heart.
            </p>
            <p>But there is another story behind my creations.</p>
            <p>A story I like to imagine whenever I walk through the woods.</p>
          </div>
        </section>

        {/* The tale */}
        <section className="ab-tale-wrap">
          <article className="ab-tale">
            <svg className="ab-tale-leaf" viewBox="0 0 48 66" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
              <path d="M39 3C23 9 9 22 8 39c-1 12 5 20 14 20 16 0 21-23 17-56Z" />
              <path d="M5 64 33 13M15 48l-2-15M21 37l14-5M26 26l-1-10M12 54l15-4" />
            </svg>
            <span className="ab-eyebrow">A LITTLE FOREST TALE</span>
            <h2 className="ab-h2">The Secret of the Forest Spirits</h2>

            <p>
              They say that deep in the forests, hidden from human eyes, live tiny woodland spirits.
            </p>
            <p>
              They wear pointed green hats, little shoes woven from bark and flower petals, and
              delicate wings that shimmer like rainbows in the morning sunlight.
            </p>
            <p>Their homes are not made of bricks or stone.</p>
            <p>
              They live inside leaves, beneath flower petals, and among the curling branches of
              ancient trees.
            </p>
            <p>For generations, the forest kept them safe.</p>
            <p>Until one day, a terrible storm came.</p>
            <p>
              The wind roared through the trees, tearing leaves from branches and scattering
              flowers across the earth.
            </p>
            <p>When the storm finally passed, the little spirits looked around in sorrow.</p>
            <p>Their beautiful homes were gone.</p>
            <p>And as they wept, it seemed that even the forest was crying with them.</p>

            <div className="ab-tale-break" aria-hidden="true" />

            <p>
              But somewhere nearby lived a woman who loved the woods and all the little things that
              made them beautiful.
            </p>
            <p>She gathered the fallen leaves and flowers, one by one.</p>
            <p>Then, with patience, love, and a little magic, she transformed them into copper.</p>
            <p>
              She adorned them with beautiful stones and gave them colors that shimmered in the
              sunlight.
            </p>
            <p className="ab-emph">And something wonderful happened.</p>
            <p>
              The little forest spirits found new homes. Homes made from the very leaves and
              flowers they had once loved, now transformed into something strong and enduring.
            </p>
            <p>The forest was no longer quite so sad.</p>
            <p>And the little spirits had a reason to smile again.</p>
          </article>
        </section>

        {/* A story to carry */}
        <section className="ab-close">
          <span className="ab-eyebrow">A PIECE OF NATURE</span>
          <h2 className="ab-h2">A Story to Carry</h2>
          <p>Perhaps that woman in the story is a little like me.</p>
          <p>
            Every time I find a beautiful leaf or a delicate flower, I imagine the small world it
            might hold.
          </p>
          <p>
            And when I transform it into jewelry, I feel as though I am preserving more than its
            shape.
          </p>
          <p>I am preserving a moment. A memory. A little piece of the natural world.</p>

          <blockquote className="ab-quote">
            No two leaves are exactly alike. And no two of my creations are exactly alike.
          </blockquote>

          <p>
            Each piece begins with something real — something that once grew beneath the Kentucky
            sun, danced in the wind, and belonged to the living earth.
          </p>
          <p>Now it can become part of your story.</p>
          <p>
            A gift of love. A reminder of a special place. A symbol of strength after a storm. Or
            simply something beautiful that speaks to your heart.
          </p>
          <p>Thank you for visiting my little world of copper and nature.</p>
          <p>I hope you find something here that feels as though it was made just for you.</p>

          <div className="ab-sign">
            <em>With love and a little forest magic,</em>
            <strong>Elena Young</strong>
            <span>ARTIST &amp; CREATOR</span>
          </div>
        </section>

        {/* Photo strip + call to action */}
        <section className="ab-strip" aria-label="Pieces from the studio">
          {[
            ['/assets/fern-bracelet.webp', 'Forest Fern Bracelet'],
            ['/assets/oak-pendant.webp', 'Oak Leaf Pendant'],
            ['/assets/birch-earrings.webp', 'Birch Leaf Earrings'],
          ].map(([src, alt]) => (
            <div key={src} className="ab-strip-item">
              <Image src={src} alt={alt} fill sizes="(max-width: 900px) 33vw, 28vw" />
            </div>
          ))}
        </section>

        <div className="ab-cta">
          <Link href="/shop" className="button button-dark">
            SHOP THE COLLECTION
          </Link>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <div className="brand brand-light flex items-center gap-[15px]">
            <svg className="w-[34px] h-[49px] text-[#d9dfcc]" viewBox="0 0 48 66" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M39 3C23 9 9 22 8 39c-1 12 5 20 14 20 16 0 21-23 17-56Z" />
              <path d="M5 64 33 13M15 48l-2-15M21 37l14-5M26 26l-1-10M12 54l15-4" />
            </svg>
            <span><strong>LEAVES OF KENTUCKY</strong><small>ARTISAN JEWELRY</small></span>
          </div>
          <p className="italic mt-5 ml-[49px] text-[#aebcac]">Nature’s beauty,<br/>made to stay with you.</p>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Leaves of Kentucky</span>
          <span>Made with respect for nature</span>
        </div>
      </footer>
    </div>
  );
}
