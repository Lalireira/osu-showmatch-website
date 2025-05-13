export default function Home() {
  return (
    <main className="min-h-screen bg-[#050813]">
      <div className="container mx-auto px-4 py-8">
        {/* メインビジュアル */}
        <section className="mb-12" style={{ height: '400px' }}>
          <div className="relative h-full bg-[#2a2a2a] rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-white">osu! Showmatch</h1>
            </div>
          </div>
        </section>

        {/* Schedule & Details */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-white">Schedule & Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#2a2a2a] p-6 rounded-lg h-[200px]">
              <h3 className="text-xl font-semibold mb-4 text-white">Important Dates</h3>
              <ul className="space-y-2 text-gray-300 font-normal">
                <li>Mappool Announcement: TBA</li>
                <li>Match Day: TBA</li>
              </ul>
            </div>
            <div className="bg-[#2a2a2a] p-6 rounded-lg h-[200px]">
              <h3 className="text-xl font-semibold mb-4 text-white">Staff</h3>
              <ul className="space-y-2 text-gray-300 font-normal">
                <li>Manager: TBA</li>
                <li>Mappool Selector: TBA</li>
                <li>Commentator: TBA</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Rules */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-white">Rules</h2>
          <div className="bg-[#2a2a2a] p-6 rounded-lg">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">1. チーム編成 / Team Formation</h3>
                <div className="my-4 border-t border-gray-600"></div>
                <div className="pl-4">
                  <p className="text-gray-300 font-normal">2鯖(2nd Server)参加者の中から招待制でチームを決定。</p>
                  <p className="text-gray-300 mt-2 font-normal">チーム分けについては運営側(Manager,Mappooler)がバランスを考慮し、チーム分けを実施。</p>
                  <div className="my-4"></div>
                  <p className="text-[#888888] font-light text-sm">Teams will be formed by invitation from 2nd Server participants.</p>
                  <p className="text-[#888888] mt-2 font-light text-sm">Team distribution will be conducted by the staff (Manager, Mappooler) considering balance.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">2. 試合形式 / Match Format</h3>
                <div className="my-4 border-t border-gray-600"></div>
                <div className="pl-4">
                  <p className="text-gray-300 font-normal">TeamSizeは6人、試合は&quot;TeamVS&quot;を使用、スコアは&quot;ScoreV2&quot;を使用した4vs4、7本先取(BO13)</p>
                  <p className="text-gray-300 mt-2 font-normal">TBは特別ルールとしての6vs6での勝負とする。</p>
                  <div className="my-4"></div>
                  <p className="text-[#888888] font-light text-sm">TeamSize is 6 players, using &quot;TeamVS&quot; format, &quot;ScoreV2&quot; scoring system, 4v4, Best of 13 (First to 7)</p>
                  <p className="text-[#888888] mt-2 font-light text-sm">Tiebreaker will be played as a special 6v6 match.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">3. 試合運営 / Match Management</h3>
                <div className="my-4 border-t border-gray-600"></div>
                <div className="pl-4">
                  <p className="text-gray-300 font-normal">&quot;!roll&quot;を使用して順番を決定。順次ピックを実施。</p>
                  <p className="text-gray-300 mt-2 font-normal">今回のショーマッチにてMAP BANは無し。</p>
                  <p className="text-gray-300 mt-2 font-normal">出場回数に制限あり。各プレイヤーは事前に出場する譜面を決め、12譜面の登録が必要。</p>
                  <div className="my-4"></div>
                  <p className="text-[#888888] font-light text-sm">Order will be determined using &quot;!roll&quot;. Sequential pick will be implemented.</p>
                  <p className="text-[#888888] mt-2 font-light text-sm">There will be no MAP BAN in this showmatch.</p>
                  <p className="text-[#888888] mt-2 font-light text-sm">There is a limit on participation. Each player must pre-register 12 maps they will play.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">4. マッププール / Mappool</h3>
                <div className="my-4 border-t border-gray-600"></div>
                <div className="pl-4">
                  <p className="text-gray-300 font-normal">TB含め、19譜面。</p>
                  <p className="text-gray-300 mt-2 font-normal">NoMod 5, Hidden 3, HardRock 3, DoubleTime 4, FreeMod 3, TieBreak 1</p>
                  <p className="text-gray-300 mt-2 font-normal">FreeModでは、HardRockが1人以上、Hiddenを1人以上付けなければいけない。</p>
                  <p className="text-gray-300 mt-2 font-normal">Hidden + HardRockの場合は、HardRockとして扱うため、Hiddenを1人以上つけなければいけない。</p>
                  <p className="text-gray-300 mt-2 font-normal">EasyはHiddenの代用となるが、スコア算出はx1.8倍とする。</p>
                  <div className="my-4"></div>
                  <p className="text-[#888888] font-light text-sm">19 maps including TB.</p>
                  <p className="text-[#888888] mt-2 font-light text-sm">NoMod 5, Hidden 3, HardRock 3, DoubleTime 4, FreeMod 3, TieBreak 1</p>
                  <p className="text-[#888888] mt-2 font-light text-sm">In FreeMod, at least one player must use HardRock and one player must use Hidden.</p>
                  <p className="text-[#888888] mt-2 font-light text-sm">When using Hidden + HardRock, it counts as HardRock, so at least one player must use Hidden.</p>
                  <p className="text-[#888888] mt-2 font-light text-sm">Easy can be used as a substitute for Hidden, but score will be multiplied by 1.8x.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">5. 禁止事項 / Prohibited Actions</h3>
                <div className="my-4 border-t border-gray-600"></div>
                <div className="pl-4">
                  <p className="text-gray-300 font-normal">試合妨害、暴言、遅延行為は禁止。</p>
                  <p className="text-gray-300 mt-2 font-normal">またその他運営が違反と判断した場合はこの限りではない。</p>
                  <div className="my-4"></div>
                  <p className="text-[#888888] font-light text-sm">Match interference, abusive language, and intentional delays are prohibited.</p>
                  <p className="text-[#888888] mt-2 font-light text-sm">Other actions may be considered violations at the staff&apos;s discretion.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">6. 試合日程 / Match Schedule</h3>
                <div className="my-4 border-t border-gray-600"></div>
                <div className="pl-4">
                  <p className="text-gray-300 font-normal">マッププール公開は11/30 0:00。</p>
                  <p className="text-gray-300 mt-2 font-normal">試合日は12/14 19:00より開始。</p>
                  <div className="my-4"></div>
                  <p className="text-[#888888] font-light text-sm">Mappool will be released on November 30th at 00:00.</p>
                  <p className="text-[#888888] mt-2 font-light text-sm">Match will start on December 14th at 19:00.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
