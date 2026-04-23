import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata = {
  title: "Terms of Service | Catalyst Bar",
};

export default function TermsPage() {
  return (
    <main className={`${raleway.className} bg-white text-[#1A1A1A] p-6 md:p-20 max-w-full text-[11px] leading-[1.3]`}>
      <div className="max-w-4xl mx-auto border border-gray-200 p-8 md:p-16 bg-white shadow-sm">
        <h1 className="text-sm font-bold uppercase mb-1 underline tracking-tight">TERMS OF SERVICE</h1>
        <p className="mb-8 text-gray-400">Effective Date: April 22, 2026</p>
        
        <div className="space-y-6 text-justify">
          <section>
            <h2 className="font-bold mb-1">1. LOREM IPSUM DOLOR</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">2. CONSECTETUR ADIPISCING ELIT</h2>
            <p>
              Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">3. SED DO EIUSMOD TEMPOR</h2>
            <p>
              Donec hendrerit tempor tellus. Donec pretium posuere tellus. Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla posuere. Donec vitae dolor. Nullam tristique diam non turpis. Cras placerat accumsan nulla. Nullam rutrum. Nam vestibulum accumsan nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">4. INCIDIDUNT UT LABORE</h2>
            <p>
              In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed hendrerit. Morbi ac felis. Nunc egestas, augue at pellentesque laoreet, felis eros vehicula leo, at malesuada velit leo quis pede. Donec interdum, metus et hendrerit aliquet, dolor diam sagittis ligula.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">5. ET DOLORE MAGNA ALIQUA</h2>
            <p>
              Praesent nonummy mi in libero. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">6. UT ENIM AD MINIM VENIAM</h2>
            <p>
              Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">7. QUIS NOSTRUD EXERCITATION</h2>
            <p>
              Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">8. ULLAMCO LABORIS NISI</h2>
            <p>
              Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">9. UT ALIQUIP EX EA COMMODO</h2>
            <p>
              Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">10. DUIS AUTE IRURE DOLOR</h2>
            <p>
              Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat.
            </p>
          </section>
        </div>

        <div className="mt-16 text-gray-300 text-[8px] tracking-[0.2em] border-t pt-4 text-center">
          LEGAL REPOSITORY • SECTION 44-B-CATALYST • PROPRIETARY INFORMATION
        </div>
      </div>
    </main>
  );
}
