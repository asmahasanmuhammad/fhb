const posterPlan = [
  {
    id: "cmwancsis0176ljfw8il4v70e", // 1. Dhaka Derby Mohammedan vs Abahani
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1516731415730-0c607149933a?w=1600&auto=format&fit=crop&q=90" // electric stadium under lights
  },
  {
    id: "cmwancsj1017iljfw50iuxrfl", // 2. SAFF Semi-Final: Bangladesh Ready for India
    type: "wiki",
    wikiFile: "File:Bangladesh football team group photo during the 2005 SAFF Cup.png",
    unsplashUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsir0174ljfwsa79r3zu", // 3. Champions League Matchday 5
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsig016qljfwkj6m28a1", // 4. Crisis at Old Trafford
    type: "wiki",
    wikiFile: "File:Old Trafford 2025-2026 Season by LOVE1TICKET.jpg",
    fallbackWiki: "File:2012 Olympic Football - Old Trafford (4).jpg"
  },
  {
    id: "cmwal597m00aklj28co16ekrn", // 5. FIFA Grants Full Clearance for Hamza Choudhury
    type: "wiki",
    wikiFile: "File:Hamza Choudhury 24082024 (2).jpg"
  },
  {
    id: "cmwancsj6017oljfw76p19us9", // 6. January Window Watch: Five BFL Deals
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsid016mljfwpf37jxt7", // 7. Arsenal's Machine Rolls On
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsi6016iljfwi3fwg990", // 8. Mbappé Double Wins El Clásico
    type: "wiki",
    wikiFile: "File:Kylian Mbappe France v Senegal 16 June 2026-391 (cropped).jpg",
    fallbackWiki: "File:Kylian Mbappe France v Morocco 9 July 2026-163.jpg"
  },
  {
    id: "cmwal597o00amlj28dfmpjzp0", // 9. Kings Arena Fortress
    type: "wiki",
    wikiFile: "File:Bashundhara Kings Arena 1.jpg"
  },
  {
    id: "cmwancsjb017uljfw1uzk7jcs", // 10. Opinion: Build Next Golden Generation Around Morsalin and Jibon
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsj3017kljfwlmgy4kmd", // 11. Hamza Choudhury: The Premier League Man
    type: "wiki",
    wikiFile: "File:Hamza Choudhury 24082024 (1).jpg"
  },
  {
    id: "cmwancsiu0178ljfwuy1x8r48", // 12. Mohammedan's Perfect Start: Four Wins, 13 Goals
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsij016uljfwyeel4ayp", // 13. Der Klassiker Days Away
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsii016sljfwt3sh6uyu", // 14. Lazio Unbeaten and Top of Serie A
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsif016oljfwmazllje9", // 15. Brighton's Dream Start
    type: "wiki",
    wikiFile: "File:Fulham vs Brighton & Hove Albion 24012026 (2).jpg"
  },
  {
    id: "cmwal597p00aolj2817zlt3qp", // 16. Dhaka Derby Rekindled (50 Years)
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsj9017sljfwqkn6j0a3", // 17. Transfer Gossip: Owusu's Exit Clause
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsip0172ljfwezkvayx1", // 18. Man City's Three-Game Losing Streak
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsim016yljfwwrjmv3sc", // 19. Paris FC's Fairytale
    type: "wiki",
    wikiFile: "File:Paris FC - RC Lens 2017-12-08 Stade Charléty Paris 1.jpg"
  },
  {
    id: "cmwancsil016wljfw58uhu3cj", // 20. Haaland Leads Golden Boot
    type: "wiki",
    wikiFile: "File:Erling Haaland Morocco v Norway 7 June 2026-103.jpg",
    fallbackWiki: "File:Erling Haaland 2023.jpg"
  },
  {
    id: "cmwal598700aqlj28rrlgcbpk", // 21. European Transfer Radar: Belgian Giants Royal Antwerp
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsjc017wljfws0ne91th", // 22. Opinion: What 48-Team World Cup Teaches Bangladesh
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsiv017aljfw9hytsx2t", // 23. Bangladesh Police: Meanest Defence in BFL
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1516731415730-0c607149933a?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsio0170ljfw8e3n39f0", // 24. Barcelona's 46-Goal Onslaught
    type: "wiki",
    wikiFile: "File:Camp Nou, La Liga match (Ank Kumar) 02.jpg"
  },
  {
    id: "cmwal598b00aslj282v41dbuv", // 25. Goalkeeping Excellence: Mitul Marma
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsj7017qljfwnjrg8x4s", // 26. European Scout Report: BFL Talents
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsix017cljfweoafqh2x", // 27. Bashundhara Kings Begin Hunt for 7th Title
    type: "wiki",
    wikiFile: "File:Bashundhara Kings Arena.jpg"
  },
  {
    id: "cmwal598d00aulj281w58c7ml", // 28. Tactical Deep Dive: Javier Cabrera
    type: "wiki",
    wikiFile: "File:Javier Fernández Cabrera with Bangladesh in 2023.jpg"
  },
  {
    id: "cmwancsiz017eljfwq6uwojqd", // 29. Federation Cup Semi-Finals Set
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwal598f00awlj28l4ve0axq", // 30. Women's Football Triumph: SAFF Champions
    type: "wiki",
    wikiFile: "File:Bangladesh Women's Football team in Dhaka after winning the SAFF Championship 2024.jpg"
  },
  {
    id: "cmwancsj0017gljfwc66gfb8j", // 31. Rebranded and Rising: How BFL Is Winning Back Fans
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwal598h00aylj28damawdvo", // 32. AFC Challenge League Campaign: Bashundhara Kings
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&auto=format&fit=crop&q=90"
  },
  {
    id: "cmwancsj4017mljfw7kbnsplh", // 33. Bangabandhu National Stadium
    type: "wiki",
    wikiFile: "File:Bangabandhu National Stadium in 2022.03.jpg"
  },
  {
    id: "cmwancsib016kljfwu4l0ybn5", // 34. Spain, Champions of the World
    type: "unsplash",
    unsplashUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&auto=format&fit=crop&q=90"
  }
];

module.exports = { posterPlan };
