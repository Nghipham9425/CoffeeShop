import { NavLink } from "react-router-dom"
import { FeatureGrid } from "../../../components/home/FeatureGrid"
import { ImageCardGrid } from "../../../components/home/ImageCardGrid"
import { Reveal } from "../../../components/home/Reveal"
import { SectionHeading } from "../../../components/home/SectionHeading"
import { StatsGrid } from "../../../components/home/StatsGrid"
import { Seo } from "../../../components/Seo"
import {
  categories,
  cleanFeatures,
  posts,
  stats,
  strengths,
  team,
} from "./homeData"

export function HomePage() {
  return (
    <main>
      <Seo
        title="Nhà máy rang xay và gia công cà phê"
        description="Phú Tài Coffee Works cung cấp cà phê rang xay, gia công OEM, báo giá B2B và giải pháp nguồn hàng cho quán, đại lý, doanh nghiệp F&B."
        canonicalPath="/"
        keywords="cà phê rang xay, gia công cà phê, OEM cà phê, cà phê B2B, Phú Tài Coffee Works"
        structuredData={{ "@context": "https://schema.org", "@type": "Organization", name: "Phú Tài Coffee Works", url: window.location.origin, description: "Nhà máy rang xay, cung ứng và gia công cà phê B2C/B2B." }}
      />
      <section>
        <div className="hm-hero">
          <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-20 lg:py-28">
            <h1 className="hm-heading hm-hero-title max-w-4xl text-4xl font-black uppercase leading-[1.12] text-white sm:text-5xl lg:text-6xl">
              Xưởng rang xay gia công cà phê Phú Tài Coffee Works
            </h1>
            <p className="mt-5 max-w-4xl text-base font-bold leading-7 text-white md:text-lg md:leading-8">
              Phú Tài nhận rang gia công, phối trộn và đóng gói cà phê theo yêu
              cầu cho quán, đại lý, doanh nghiệp F&B và thương hiệu riêng.
            </p>
            <p className="mt-5 max-w-4xl text-sm font-semibold leading-7 text-white/95 md:text-base">
              Cam kết chất lượng ổn định, quy trình rõ ràng, tư vấn nhanh và sản
              lượng phù hợp cho khách hàng B2B cần nguồn hàng lâu dài.
            </p>
            <NavLink
              to="/dich-vu"
              className="mt-14 inline-flex border-2 border-white bg-white px-10 py-4 text-lg font-black text-stone-950 shadow-lg shadow-black/20 transition hover:bg-transparent hover:text-white"
            >
              Xem thêm
            </NavLink>
          </div>
        </div>
      </section>

      <section className="hm-section grid items-center gap-12 lg:grid-cols-[0.9fr_1.4fr]">
        <Reveal>
          <div className="hm-cup-visual" />
        </Reveal>
        <Reveal delay={100}>
          <SectionHeading title="Thế mạnh của chúng tôi" align="left" />
          <div className="mt-16">
            <FeatureGrid items={strengths} />
          </div>
        </Reveal>
      </section>

      <section className="hm-section grid items-center gap-16 bg-[#f2f2f2] lg:grid-cols-[1fr_1.05fr]">
        <Reveal>
          <SectionHeading title="Chúng tôi làm gì?" align="left" />
          <p className="mt-10 max-w-3xl text-2xl leading-[1.9] text-stone-900">
            Nếu bạn đang tìm kiếm một xưởng rang gia công cà phê để tạo ra sản
            phẩm theo yêu cầu riêng, Phú Tài là lựa chọn phù hợp. Chúng tôi hỗ
            trợ từ chọn nguyên liệu, xây dựng profile rang, phối trộn, đóng gói
            đến tư vấn quy cách cho bán sỉ và thương hiệu riêng.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <div className="hm-bean-circle" />
        </Reveal>
      </section>

      <section className="bg-[#efefef] px-6 py-24">
        <Reveal>
          <SectionHeading title="Những con số biết nói" />
        </Reveal>
        <Reveal delay={100}>
          <StatsGrid items={stats} />
        </Reveal>
      </section>

      <section className="hm-section">
        <Reveal>
          <SectionHeading title="Hạng mục gia công cà phê" />
        </Reveal>
        <Reveal delay={100}>
          <div className="mx-auto mt-16 h-px max-w-5xl bg-stone-200" />
          <ImageCardGrid
            items={categories}
            columns="four"
            imageKind="service"
          />
        </Reveal>
      </section>

      <section className="hm-section">
        <Reveal>
          <SectionHeading title="Vì sao nên chọn chúng tôi?" />
        </Reveal>
        <Reveal delay={100}>
          <div className="mx-auto mt-12 h-px max-w-lg bg-stone-200" />
          <div className="mx-auto mt-14 grid max-w-[1220px] items-center gap-16 lg:grid-cols-2">
            <div className="text-xl leading-9 text-stone-800">
              <p className="font-black text-stone-900">
                Phú Tài Coffee Works tập trung vào sản xuất cà phê B2B: cung ứng
                sỉ, rang gia công, OEM và private label cho khách hàng trong
                nước.
              </p>
              <p className="mt-8">
                Chúng tôi giúp khách hàng tiết kiệm thời gian thử nghiệm, giảm
                rủi ro chất lượng và có nguồn hàng ổn định để phát triển quán,
                đại lý hoặc thương hiệu cà phê riêng.
              </p>
              <ul className="mt-8 list-disc space-y-3 pl-8">
                <li>
                  Cung cấp cà phê bột, cà phê hạt, drip bag, capsule và hòa tan.
                </li>
                <li>
                  Nhận gia công theo yêu cầu về hương vị, màu rang, bao bì.
                </li>
                <li>
                  Tư vấn quy trình đặt hàng, mẫu thử, sản xuất và giao hàng.
                </li>
              </ul>
            </div>
            <div className="hm-why-photo" />
          </div>
        </Reveal>
      </section>

      <section className="bg-[#efefef] px-6 py-24">
        <Reveal>
          <SectionHeading title="Cà phê rang xay hạt sạch" />
        </Reveal>
        <Reveal delay={100}>
          <div className="mx-auto mt-16 max-w-[1240px]">
            <FeatureGrid
              items={cleanFeatures}
              columns="three"
              iconTone="dark"
            />
          </div>
        </Reveal>
      </section>

      <section className="hm-section">
        <Reveal>
          <SectionHeading
            title="Đội ngũ nhân sự nhiệt huyết"
            subtitle="Thành công của chúng tôi được làm nên từ sự tận tâm của mỗi cá nhân"
          />
        </Reveal>
        <Reveal delay={100}>
          <ImageCardGrid items={team} columns="three" imageKind="team" />
        </Reveal>
      </section>

      <section className="hm-section">
        <Reveal>
          <SectionHeading
            title="Tin tức mới nhất"
            subtitle="Cập nhật nhanh thông tin mới về thị trường, giá cà phê và kinh nghiệm sản xuất"
          />
        </Reveal>
        <Reveal delay={100}>
          <ImageCardGrid items={posts} columns="five" imageKind="post" />
        </Reveal>
      </section>
    </main>
  )
}
