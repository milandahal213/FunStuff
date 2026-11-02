/* Mahabharata explorer data: the single source of truth for all three views.
   Times are story-relative years: year 0 is the game of dice. War days run 1–18.
   The epic's internal chronology is loose and traditions disagree, so every age and
   span here is an approximate, illustrative reconstruction, and the pages say so. */
(function () {
  const MB = window.MB = window.MB || {};

  // War day d (1–18) as a story time. Day 1 falls about seven months after the dice exile ends.
  const WAR0 = 13.6;
  const W = d => +(WAR0 + (d - 1) / 365).toFixed(5);
  MB.WAR0 = WAR0; MB.W = W;

  /* ---------- places ---------- */
  MB.places = {
    hastinapura: { name: "Hastinapura", lon: 78.03, lat: 29.17, lab: "r", modern: "Hastinapur, Meerut district, Uttar Pradesh", role: "Capital of the Kuru kingdom. Dhritarashtra’s court, and later Yudhishthira’s." },
    indraprastha: { name: "Indraprastha", lon: 77.25, lat: 28.61, lab: "l", modern: "Delhi; tradition links it to the Purana Qila", role: "The Pandavas’ own capital, built where the Khandava forest once stood." },
    varanavata: { name: "Varanavata", lon: 77.43, lat: 29.10, lab: "l", modern: "Often identified with Barnawa, Baghpat district, Uttar Pradesh", role: "Site of the house of lac that was meant to burn the Pandavas alive." },
    ekachakra: { name: "Ekachakra", lon: 79.10, lat: 26.72, lab: "b", modern: "Location debated. Candidates include Chakarnagar near Etawah (shown here) and Ekchakra in Birbhum, West Bengal", role: "Where the Pandavas hid as brahmins after the fire, and where Bhima killed the demon Baka." },
    kampilya: { name: "Kampilya (Panchala)", lon: 79.28, lat: 27.62, lab: "r", modern: "Kampil, Farrukhabad district, Uttar Pradesh", role: "King Drupada’s capital, where Draupadi’s swayamvara was held." },
    kashi: { name: "Kashi", lon: 83.00, lat: 25.32, lab: "r", modern: "Varanasi, Uttar Pradesh", role: "Kingdom of the princesses Amba, Ambika and Ambalika." },
    gandhara: { name: "Gandhara", lon: 72.83, lat: 33.75, lab: "r", modern: "Around Taxila, northern Pakistan", role: "Homeland of Gandhari and her brother Shakuni." },
    madra: { name: "Madra", lon: 74.53, lat: 32.49, lab: "r", modern: "Around Sialkot, Pakistani Punjab (ancient Sakala)", role: "Homeland of Madri, mother of Nakula and Sahadeva, and of her brother Shalya." },
    rajagriha: { name: "Magadha", lon: 85.42, lat: 25.03, lab: "b", modern: "Rajgir, Bihar (ancient Girivraja)", role: "Jarasandha’s capital, ringed by hills." },
    anga: { name: "Anga", lon: 86.98, lat: 25.25, lab: "r", modern: "Near Bhagalpur, Bihar (ancient Champa)", role: "The kingdom Duryodhana gave to Karna." },
    dwaraka: { name: "Dwarka", lon: 68.97, lat: 22.24, lab: "r", modern: "Dwarka, on the Gujarat coast", role: "Krishna’s city on the western sea, later swallowed by the waves." },
    kamyaka: { name: "Kamyaka forest", lon: 76.45, lat: 30.12, lab: "l", modern: "Kurukshetra region, Haryana (traditional)", role: "The forest where the Pandavas spent much of their exile, near the Sarasvati." },
    virata: { name: "Virata (Matsya)", lon: 76.17, lat: 27.45, lab: "l", modern: "Viratnagar (Bairat), Jaipur district, Rajasthan", role: "King Virata’s capital. The nearby town of Upaplavya became the Pandavas’ war camp." },
    kurukshetra: { name: "Kurukshetra", lon: 76.85, lat: 29.97, lab: "r", modern: "Kurukshetra, Haryana", role: "The plain where the 18-day war was fought." },
    himalaya: { name: "Himalaya", lon: 79.49, lat: 30.74, lab: "r", modern: "Around Badrinath, Uttarakhand (approximate)", role: "Where Arjuna sought divine weapons, and where the Pandavas’ final journey ends." },
  };

  /* ---------- chapters (the map's ten chapters; the story view expands the war) ---------- */
  // t: the story time the chapter represents, used to grey out who has died by then.
  MB.chapters = [
    { id: "kuru-house", title: "The Kuru house", short: "The Kuru house", span: "About two generations before the war", t: -44,
      text: "Long before the cousins are born, Hastinapura draws brides and alliances from across the north. Bhishma, who gave up the throne and marriage so his father could marry Satyavati, rides east to Kashi and carries off three princesses for his half-brother. A generation later Gandhari arrives from far-off Gandhara with her brother Shakuni, and Pandu brings Madri from Madra. Notice how far these marriages reach: from the Ganga to beyond the Indus.",
      legs: [["kashi", "hastinapura", "kuru", "Bhishma brings the Kashi princesses"], ["gandhara", "hastinapura", "kuru", "Gandhari comes to marry Dhritarashtra"], ["madra", "hastinapura", "kuru", "Madri comes to marry Pandu"]],
      chars: ["bhishma", "satyavati", "amba", "ambika", "ambalika", "vichitravirya", "vyasa", "dhritarashtra", "pandu", "vidura", "gandhari", "shakuni", "kunti", "madri", "shalya"] },
    { id: "lac", title: "The house of lac", short: "House of lac", span: "Childhood to youth, then one night", t: -18,
      text: "After Pandu dies in the forest, Kunti brings her five sons to Hastinapura, where they grow up beside their hundred Kaurava cousins and train under Drona. A jealous Duryodhana sends them to a festival at nearby Varanavata and has a palace built of lac and resin, meant to burn with them inside. Warned by Vidura, they escape through a tunnel, disappear into the forest, and end up hiding as wandering brahmins in Ekachakra.",
      legs: [["hastinapura", "varanavata", "pandava", "Sent to the festival"], ["varanavata", "ekachakra", "pandava", "Escape through the forest"]],
      chars: ["kunti", "yudhishthira", "bhima", "arjuna", "nakula", "sahadeva", "duryodhana", "vidura", "dhritarashtra", "drona", "karna"] },
    { id: "swayamvara", title: "Draupadi’s swayamvara", short: "Swayamvara", span: "Months", t: -17,
      text: "Word reaches them that King Drupada of Panchala is holding a contest for his daughter’s hand at Kampilya. Still in disguise, Arjuna strings the great bow and hits the target that defeated every prince, and Draupadi becomes the wife of all five brothers. Their survival is out in the open now, and with Panchala as an ally they return to Hastinapura to claim a share of the kingdom.",
      legs: [["ekachakra", "kampilya", "pandava", "To the contest"], ["kampilya", "hastinapura", "pandava", "Return, now with Panchala as ally"]],
      chars: ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva", "kunti", "draupadi", "drupada", "dhrishtadyumna", "krishna", "karna"] },
    { id: "indraprastha", title: "Indraprastha rises", short: "Indraprastha", span: "Several years", t: -1,
      text: "Dhritarashtra grants them Khandavaprastha, a wild tract on the Yamuna. With Krishna’s help they clear the Khandava forest and build Indraprastha, close to where Delhi stands today. Before Yudhishthira can hold the Rajasuya, the royal consecration, Bhima, Arjuna and Krishna travel far east to Magadha, where Bhima kills the emperor Jarasandha in a wrestling bout. The ceremony that follows makes Yudhishthira supreme, and Duryodhana leaves it burning with envy.",
      legs: [["hastinapura", "indraprastha", "pandava", "Granted their half of the kingdom"], ["dwaraka", "indraprastha", "pandava", "Krishna joins them"], ["indraprastha", "rajagriha", "pandava", "Journey to face Jarasandha"]],
      chars: ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva", "draupadi", "krishna", "subhadra", "jarasandha", "duryodhana"] },
    { id: "dice", title: "The game of dice", short: "Game of dice", span: "A single day", t: 0,
      text: "Invited back to Hastinapura, Yudhishthira plays dice against Shakuni, who throws on Duryodhana’s behalf. He loses his wealth, his kingdom, his brothers, himself and finally Draupadi, who is dragged into the assembly and humiliated. A second game ends in a fixed sentence: twelve years in the forest and a thirteenth in hiding. If they are found during that last year, the exile begins again.",
      legs: [["indraprastha", "hastinapura", "pandava", "Summoned to the game"]],
      chars: ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva", "draupadi", "shakuni", "duryodhana", "dushasana", "karna", "bhishma", "drona", "vidura", "dhritarashtra"] },
    { id: "forest", title: "Twelve years in the forest", short: "Forest exile", span: "12 years", t: 6,
      text: "The brothers and Draupadi live mostly in the Kamyaka and Dvaita forests, in the old Kuru heartland along the Sarasvati. The exile is far from idle. Arjuna goes into the Himalaya to win divine weapons, first from Shiva and then in Indra’s heaven, and the family makes long pilgrimages to sacred sites across the land. Near the end, Yudhishthira answers a yaksha’s riddles at a lake to bring his brothers back to life.",
      legs: [["hastinapura", "kamyaka", "pandava", "Into exile"], ["kamyaka", "himalaya", "pandava", "Arjuna’s quest for weapons"]],
      chars: ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva", "draupadi"] },
    { id: "hiding", title: "The year in hiding", short: "Year in hiding", span: "1 year", t: 12.6,
      text: "For the thirteenth year they take service in disguise at King Virata’s court in Matsya: Yudhishthira as a courtier, Bhima as a cook, Arjuna as a dance teacher, Nakula and Sahadeva with the horses and cattle, and Draupadi as the queen’s maid. Bhima kills the general Kichaka for harassing Draupadi. As the year runs out, the Kauravas raid Matsya’s herds, and Arjuna drives them back just as the term ends.",
      legs: [["kamyaka", "virata", "pandava", "To Virata’s court in disguise"], ["hastinapura", "virata", "kaurava", "Kaurava cattle raid"]],
      chars: ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva", "draupadi", "virata", "uttara", "duryodhana", "karna", "bhishma", "drona"] },
    { id: "armies", title: "Gathering the armies", short: "Armies gather", span: "Months", t: 13.45,
      text: "From Upaplavya in Matsya, the Pandavas call on their allies while Duryodhana gathers his. Both Arjuna and Duryodhana travel to Dwarka to ask for Krishna’s help. Arjuna chooses Krishna himself, who will not fight; Duryodhana takes Krishna’s army. Krishna then goes to Hastinapura on a last peace mission, asking for as little as five villages, and is refused. The colors show roughly how the kingdoms divided: seven armies (akshauhinis) for the Pandavas, eleven for the Kauravas.",
      legs: [["virata", "dwaraka", "pandava", "Arjuna goes to Krishna"], ["hastinapura", "dwaraka", "kaurava", "Duryodhana goes to Krishna"], ["virata", "hastinapura", "pandava", "Krishna’s peace mission"]],
      factions: { virata: "pandava", kampilya: "pandava", kashi: "pandava", rajagriha: "pandava", dwaraka: "pandava", hastinapura: "kaurava", gandhara: "kaurava", madra: "kaurava", anga: "kaurava" },
      chars: ["krishna", "arjuna", "duryodhana", "yudhishthira", "dhritarashtra", "bhishma", "vidura", "karna"] },
    { id: "kurukshetra", title: "Kurukshetra", short: "Kurukshetra", span: "18 days", t: W(18.9),
      text: "Both sides march to the plain of Kurukshetra. Before the first arrow flies, Krishna speaks the Bhagavad Gita to a wavering Arjuna. The Kaurava command passes from Bhishma (10 days) to Drona (5), Karna (2) and Shalya (1), and nearly every great warrior on both sides falls. When the eighteen days are over, only a handful are left alive.",
      legs: [["virata", "kurukshetra", "pandava", "Pandava army marches"], ["hastinapura", "kurukshetra", "kaurava", "Kaurava army marches"]],
      chars: ["krishna", "arjuna", "yudhishthira", "bhima", "bhishma", "drona", "karna", "shalya", "duryodhana", "dhrishtadyumna"] },
    { id: "aftermath", title: "The long aftermath", short: "Aftermath", span: "36 years and beyond", t: 50.4,
      text: "Yudhishthira is crowned at Hastinapura and rules for 36 years. Then word comes from Dwarka: the Yadavas have destroyed one another, Krishna is dead, and the sea has swallowed the city. The Pandavas crown Arjuna’s grandson Parikshit and leave on foot, circling the land and passing drowned Dwarka before turning north to the Himalaya. One by one they fall, until only Yudhishthira, followed by a dog, reaches the gates of heaven.",
      legs: [["kurukshetra", "hastinapura", "pandava", "Return to be crowned"], ["hastinapura", "dwaraka", "pandava", "The final journey (eastern circuit simplified)"], ["dwaraka", "himalaya", "pandava", "North to the mountains"]],
      chars: ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva", "draupadi", "krishna", "parikshit", "dhritarashtra", "gandhari", "kunti"] },
  ];

  /* ---------- the war, split by Kaurava commander (used by the story and lifelines views) ---------- */
  MB.commanders = [
    { id: "bhishma", from: 1, to: 10, label: "Bhishma, 10 days" },
    { id: "drona", from: 11, to: 15, label: "Drona, 5 days" },
    { id: "karna", from: 16, to: 17, label: "Karna, 2 days" },
    { id: "shalya", from: 18, to: 18, label: "Shalya, 1 day" },
  ];
  MB.warSteps = [
    { id: "war-bhishma", title: "Bhishma’s ten days", span: "Days 1–10", t: W(10.5), battle: "krauncha", chapter: 9,
      text: "Krishna speaks the Bhagavad Gita to Arjuna between the two armies, and the fighting begins. With Bhishma leading the Kauravas, the Pandavas cannot break through. Each morning both sides arrange their armies in named formations, or vyuhas. Bhishma tells the Pandavas he will not fight Shikhandi, who was born a woman. On the tenth day Arjuna shoots from behind Shikhandi, and Bhishma falls onto a bed of arrows, where he chooses to stay alive until the winter solstice.",
      chars: ["bhishma", "arjuna", "krishna", "shikhandi", "yudhishthira", "duryodhana", "dhrishtadyumna"] },
    { id: "war-drona", title: "Drona’s five days", span: "Days 11–15", t: W(15.9), battle: "chakravyuha", chapter: 9,
      text: "Drona takes command. On the thirteenth day he forms the Chakravyuha, a spinning, wheel-shaped formation. Arjuna has been lured away, and only sixteen-year-old Abhimanyu knows how to break in, though not how to get out. Jayadratha seals the gap behind him, and Abhimanyu is surrounded and killed. Arjuna kills Jayadratha the next day at sunset. That night Karna spends his one-use divine spear on Ghatotkacha. On the fifteenth day, told falsely that his son is dead, Drona lays down his weapons and is killed.",
      chars: ["drona", "abhimanyu", "jayadratha", "arjuna", "ghatotkacha", "karna", "drupada", "virata", "dhrishtadyumna", "yudhishthira"] },
    { id: "war-karna", title: "Karna’s two days", span: "Days 16–17", t: W(17.9), battle: "duel", chapter: 9,
      text: "Karna leads at last, with Shalya as his reluctant charioteer. Bhima kills Dushasana, keeping the vow he made the day Draupadi was dragged into the hall. On the seventeenth day Karna and Arjuna meet. Karna’s chariot wheel sinks into the earth, and while he struggles to free it, Arjuna, urged on by Krishna, kills him.",
      chars: ["karna", "arjuna", "krishna", "shalya", "bhima", "dushasana"] },
    { id: "war-shalya", title: "The last day", span: "Day 18 and its night", t: W(18.9), battle: "lake", chapter: 9,
      text: "Shalya commands for a single day and falls to Yudhishthira. Sahadeva kills Shakuni. Duryodhana hides in a lake until the Pandavas taunt him out, then fights Bhima with maces; Bhima breaks his thigh. That night Ashwatthama creeps into the sleeping Pandava camp and kills Dhrishtadyumna, Shikhandi and Draupadi’s five sons. Of eleven Kaurava armies and seven Pandava armies, only a handful of warriors survive.",
      chars: ["shalya", "yudhishthira", "shakuni", "sahadeva", "duryodhana", "bhima", "ashwatthama", "dhrishtadyumna", "shikhandi", "upapandavas", "kripa"] },
  ];

  /* ---------- characters ----------
     gen: generation from Shantanu (0). side: allegiance used for color.
     born / died: story years (approximate). died null = unknown or never (chiranjivi). */
  const C = (id, name, gen, lineage, side, born, died, death, extra = {}) => ({ id, name, gen, lineage, side, born, died, death, parents: [], spouses: [], ...extra });
  MB.characters = [
    C("santanu", "Shantanu", 0, "Kuru", "kuru", -160, -92, "Dies while his sons by Satyavati are still young.", { spouses: ["satyavati"] }),
    C("satyavati", "Satyavati", 0, "Fisherfolk", "kuru", -118, -23, "Retires to the forest after Pandu’s death and dies there.", { spouses: ["santanu"] }),
    C("bhishma", "Bhishma", 1, "Kuru", "kuru", -136, 13.8, "Falls on day 10 and lies on a bed of arrows, dying weeks later at the winter solstice.", { parents: ["santanu"], deathEvent: "bhishma-dies", note: "Son of Shantanu and the river goddess Ganga. Fights for the Kauravas while loving both sides." }),
    C("vyasa", "Vyasa", 1, "Sage", "neutral", -119, null, "Never dies: one of the chiranjivi, the long-lived.", { parents: ["satyavati"], chiranjivi: true, note: "Satyavati’s son by the sage Parashara. Composer of the epic, and the father of Dhritarashtra, Pandu and Vidura." }),
    C("chitrangada", "Chitrangada", 1, "Kuru", "kuru", -97, -80, "Killed young by a gandharva of the same name.", { parents: ["santanu", "satyavati"] }),
    C("vichitravirya", "Vichitravirya", 1, "Kuru", "kuru", -95, -68, "Dies of illness, childless.", { parents: ["santanu", "satyavati"], spouses: ["ambika", "ambalika"] }),
    C("amba", "Amba", 1, "Kashi", "neutral", -93, -70, "Rejected by everyone, she burns herself vowing Bhishma’s death, and is reborn as Shikhandi.", { rebirth: "shikhandi" }),
    C("ambika", "Ambika", 1, "Kashi", "kuru", -92, -23, "Goes to the forest with Satyavati and dies there.", { spouses: ["vichitravirya"] }),
    C("ambalika", "Ambalika", 1, "Kashi", "kuru", -91, -23, "Goes to the forest with Satyavati and dies there.", { spouses: ["vichitravirya"] }),
    C("jarasandha", "Jarasandha", 2, "Magadha", "neutral", -85, -1, "Killed by Bhima in a wrestling match before the Rajasuya.", { deathEvent: "jarasandha" }),
    C("drona", "Drona", 2, "Teacher", "kaurava", -80, W(15), "Killed on day 15 after laying down his weapons at false news of his son’s death.", { deathEvent: "drona-dies", note: "Brahmin teacher of both sets of cousins." }),
    C("kripa", "Kripa", 2, "Teacher", "kaurava", -80, null, "Survives the war; one of the chiranjivi.", { chiranjivi: true }),
    C("drupada", "Drupada", 2, "Panchala", "pandava", -80, W(15), "Killed by Drona on day 15.", { deathEvent: "drona-dies" }),
    C("virata", "Virata", 2, "Matsya", "pandava", -72, W(15), "Killed by Drona on day 15.", { deathEvent: "drona-dies" }),
    C("shalya", "Shalya", 2, "Madra", "kaurava", -68, W(18), "Killed by Yudhishthira on day 18, the last Kaurava commander.", { deathEvent: "last-day" }),
    C("dhritarashtra", "Dhritarashtra", 2, "Kuru", "kaurava", -67, 31, "Dies in a forest fire with Gandhari and Kunti, years after the war.", { parents: ["ambika", "vyasa"], spouses: ["gandhari"], deathEvent: "forest-fire" }),
    C("pandu", "Pandu", 2, "Kuru", "kuru", -66, -24, "Dies in the forest, under a curse, when he embraces Madri.", { parents: ["ambalika", "vyasa"], spouses: ["kunti", "madri"], deathEvent: "pandu-dies" }),
    C("vidura", "Vidura", 2, "Kuru", "kuru", -65, 30.5, "Dies in the forest shortly before Dhritarashtra.", { parents: ["vyasa"], note: "Born to a maid of the palace. Wise, honest, and the first to warn the Pandavas." }),
    C("shakuni", "Shakuni", 2, "Gandhara", "kaurava", -64, W(18), "Killed by Sahadeva on day 18.", { deathEvent: "last-day" }),
    C("gandhari", "Gandhari", 2, "Gandhara", "kaurava", -62, 31, "Dies in a forest fire with Dhritarashtra and Kunti.", { spouses: ["dhritarashtra"], deathEvent: "forest-fire" }),
    C("kunti", "Kunti", 2, "Yadava", "pandava", -60, 31, "Dies in a forest fire with Dhritarashtra and Gandhari.", { spouses: ["pandu"], deathEvent: "forest-fire", note: "Krishna’s aunt, raised by King Kuntibhoja." }),
    C("madri", "Madri", 2, "Madra", "pandava", -52, -24, "Joins Pandu on his funeral pyre.", { spouses: ["pandu"], deathEvent: "pandu-dies" }),
    C("karna", "Karna", 3, "Raised by charioteers", "kaurava", -45, W(17), "Killed by Arjuna on day 17 while freeing his sunken chariot wheel.", { parents: ["kunti"], deathEvent: "karna-dies", note: "Kunti’s first son, by the sun god, born before her marriage and raised by a charioteer’s family. He learns he is the Pandavas’ elder brother only on the eve of war." }),
    C("ashwatthama", "Ashwatthama", 3, "Teacher", "kaurava", -42, null, "Cursed by Krishna to wander the earth for 3,000 years.", { parents: ["drona"], chiranjivi: true }),
    C("jayadratha", "Jayadratha", 3, "Sindhu", "kaurava", -42, W(14), "Killed by Arjuna at sunset on day 14.", { deathEvent: "jayadratha", note: "Husband of Dushala, the Kauravas’ only sister." }),
    C("shikhandi", "Shikhandi", 3, "Panchala", "pandava", -40, W(18.5), "Killed in his sleep by Ashwatthama on the night of day 18.", { parents: ["drupada"], deathEvent: "night-raid", note: "Born a girl and later became a man; the rebirth of Amba." }),
    C("balarama", "Balarama", 3, "Yadava", "neutral", -40, 49.6, "Leaves his body in meditation after the Yadavas destroy one another.", { note: "Krishna’s elder brother. Teaches both Bhima and Duryodhana the mace, and refuses to fight in the war." }),
    C("yudhishthira", "Yudhishthira", 3, "Pandava", "pandava", -40, 50.4, "The only one to reach heaven in his own body, at the end of the final journey.", { parents: ["kunti", "pandu"], spouses: ["draupadi"], deathEvent: "final-journey" }),
    C("bhima", "Bhima", 3, "Pandava", "pandava", -39, 50.35, "Falls on the final journey, the last before Yudhishthira.", { parents: ["kunti", "pandu"], spouses: ["draupadi"], deathEvent: "final-journey" }),
    C("duryodhana", "Duryodhana", 3, "Kaurava", "kaurava", -39, W(18.5), "His thigh broken by Bhima’s mace on day 18; he dies that night.", { parents: ["dhritarashtra", "gandhari"], deathEvent: "last-day", note: "Eldest of Gandhari’s hundred sons. Said to be born on the same day as Bhima." }),
    C("krishna", "Krishna", 3, "Yadava", "pandava", -39, 49.6, "Killed by a hunter’s stray arrow after the Yadavas destroy one another.", { deathEvent: "yadavas", note: "Kunti’s nephew, so the Pandavas’ cousin. Arjuna’s charioteer, who will not take up weapons himself." }),
    C("arjuna", "Arjuna", 3, "Pandava", "pandava", -38, 50.3, "Falls on the final journey.", { parents: ["kunti", "pandu"], spouses: ["draupadi", "subhadra"], deathEvent: "final-journey" }),
    C("dushasana", "Dushasana", 3, "Kaurava", "kaurava", -38, W(16), "Killed by Bhima on day 16, fulfilling Bhima’s vow.", { parents: ["dhritarashtra", "gandhari"], deathEvent: "dushasana" }),
    C("nakula", "Nakula", 3, "Pandava", "pandava", -37, 50.2, "Falls on the final journey.", { parents: ["madri", "pandu"], spouses: ["draupadi"], deathEvent: "final-journey" }),
    C("sahadeva", "Sahadeva", 3, "Pandava", "pandava", -37, 50.15, "Falls on the final journey, the first of the brothers.", { parents: ["madri", "pandu"], spouses: ["draupadi"], deathEvent: "final-journey" }),
    C("subhadra", "Subhadra", 3, "Yadava", "pandava", -32, null, "Her death is not part of the main story.", { spouses: ["arjuna"], unknownEnd: true, note: "Krishna’s sister and Arjuna’s wife." }),
    C("draupadi", "Draupadi", 3, "Panchala", "pandava", -18, 50.1, "The first to fall on the final journey.", { parents: ["drupada"], spouses: ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva"], deathEvent: "final-journey", bornNote: "Emerges from Drupada’s sacrificial fire already grown, so her lifeline starts there." }),
    C("dhrishtadyumna", "Dhrishtadyumna", 3, "Panchala", "pandava", -18, W(18.5), "Killed in his sleep by Ashwatthama on the night of day 18.", { parents: ["drupada"], deathEvent: "night-raid", bornNote: "Emerges from the same fire as Draupadi, already grown.", note: "Commander of the Pandava armies for all eighteen days." }),
    C("ghatotkacha", "Ghatotkacha", 4, "Pandava", "pandava", -17, W(14.5), "Killed by Karna’s one-use divine spear on the night of day 14.", { parents: ["bhima"], deathEvent: "ghatotkacha", note: "Son of Bhima and the rakshasi Hidimbi." }),
    C("upapandavas", "Draupadi’s five sons", 4, "Pandava", "pandava", -14, W(18.5), "Killed in their sleep by Ashwatthama on the night of day 18.", { parents: ["draupadi"], deathEvent: "night-raid", note: "One son by each of the five brothers." }),
    C("uttara", "Uttara", 4, "Matsya", "pandava", -2, null, "Her death is not part of the main story.", { parents: ["virata"], spouses: ["abhimanyu"], unknownEnd: true, note: "Princess of Matsya, Virata’s daughter." }),
    C("abhimanyu", "Abhimanyu", 4, "Pandava", "pandava", -2.5, W(13), "Trapped inside the Chakravyuha and killed on day 13.", { parents: ["arjuna", "subhadra"], spouses: ["uttara"], deathEvent: "chakravyuha" }),
    C("parikshit", "Parikshit", 5, "Pandava", "pandava", 13.9, 73.9, "Killed by the serpent Takshaka, at about sixty.", { parents: ["abhimanyu", "uttara"], deathEvent: "parikshit-dies", note: "Born after the war, struck in the womb by Ashwatthama’s weapon and revived by Krishna." }),
    C("janamejaya", "Janamejaya", 6, "Pandava", "pandava", 55, null, "His death is not part of the main story.", { parents: ["parikshit"], unknownEnd: true, note: "The epic is first told at his snake sacrifice." }),
  ];
  MB.byChar = Object.fromEntries(MB.characters.map(c => [c.id, c]));

  /* ---------- events ---------- */
  const E = (id, t, title, text, place, chars, chapter, extra = {}) => ({ id, t, title, text, place, chars, chapter, ...extra });
  MB.events = [
    E("vow", -100, "Bhishma’s vow", "Prince Devavrata gives up the throne and marriage so that his father Shantanu can marry Satyavati. From then on he is Bhishma, “the one of the terrible vow”.", "hastinapura", ["bhishma", "santanu", "satyavati"], 1),
    E("kashi", -75, "The Kashi princesses", "Bhishma carries off Amba, Ambika and Ambalika from their swayamvara for his half-brother. Amba, promised to another king, is let go, then rejected by everyone.", "kashi", ["bhishma", "amba", "ambika", "ambalika", "vichitravirya"], 1),
    E("niyoga", -67, "Three sons by Vyasa", "With Vichitravirya dead and no heir, Satyavati asks her elder son Vyasa to father children: Dhritarashtra, born blind, Pandu, born pale, and Vidura, born to a maid.", "hastinapura", ["vyasa", "satyavati", "ambika", "ambalika", "dhritarashtra", "pandu", "vidura"], 1),
    E("marriages", -46, "Gandhari, Kunti and Madri", "Dhritarashtra marries Gandhari, who blindfolds herself for life to share his blindness. Pandu marries Kunti, and then Madri.", "hastinapura", ["dhritarashtra", "gandhari", "pandu", "kunti", "madri", "shakuni", "shalya"], 1),
    E("karna-born", -45, "Karna is born", "Kunti, still unmarried, tries a sage’s boon and bears a son to the sun god. She sets him adrift on a river, and a charioteer’s family raises him.", null, ["kunti", "karna"], 1),
    E("cousins-born", -39, "The cousins are born", "Kunti and Madri bear five sons through boons from the gods while Gandhari bears a hundred sons and a daughter. Bhima and Duryodhana are said to be born on the same day.", "himalaya", ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva", "duryodhana", "dushasana", "kunti", "madri", "gandhari"], 2),
    E("pandu-dies", -24, "Pandu dies", "Under a curse that he will die if he embraces his wife, Pandu forgets himself with Madri and dies. Madri follows him onto the pyre, and Kunti brings the five boys to Hastinapura.", "himalaya", ["pandu", "madri", "kunti"], 2),
    E("tournament", -20, "The princes’ tournament", "Drona’s students show their skills. Karna matches Arjuna feat for feat and is mocked for his birth, so Duryodhana makes him king of Anga on the spot.", "hastinapura", ["drona", "arjuna", "karna", "duryodhana"], 2),
    E("lac", -18, "The house of lac", "The Pandavas escape the burning palace at Varanavata through a tunnel and vanish into the forest.", "varanavata", ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva", "kunti", "vidura", "duryodhana"], 2),
    E("swayamvara", -17, "Draupadi’s swayamvara", "Arjuna, disguised as a brahmin, wins the archery contest at Kampilya, and Draupadi marries all five brothers.", "kampilya", ["arjuna", "draupadi", "drupada", "dhrishtadyumna", "karna", "krishna"], 3),
    E("indraprastha", -15, "Indraprastha is built", "Given a wild tract on the Yamuna, the Pandavas build their own capital.", "indraprastha", ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva", "draupadi", "krishna"], 4),
    E("arjuna-away", -14, "Arjuna’s twelve years away", "After breaking a rule the brothers made about time with Draupadi, Arjuna leaves for twelve years, marrying Ulupi, Chitrangada and Krishna’s sister Subhadra along the way.", "dwaraka", ["arjuna", "subhadra", "krishna"], 4),
    E("khandava", -2, "The Khandava forest burns", "Arjuna and Krishna help the fire god burn the Khandava forest, and Arjuna receives the bow Gandiva.", "indraprastha", ["arjuna", "krishna"], 4),
    E("jarasandha", -1, "Jarasandha is killed", "Bhima, Arjuna and Krishna go to Magadha in disguise, and Bhima kills Jarasandha after days of wrestling.", "rajagriha", ["bhima", "arjuna", "krishna", "jarasandha"], 4),
    E("rajasuya", -0.6, "The Rajasuya", "Yudhishthira is consecrated as supreme king. Duryodhana slips into a pool he took for solid floor, and the laughter stays with him.", "indraprastha", ["yudhishthira", "duryodhana", "krishna"], 4),
    E("dice", 0, "The game of dice", "Yudhishthira loses everything to Shakuni, including Draupadi, who is dragged into the assembly. The sentence: twelve years in the forest and a thirteenth in hiding.", "hastinapura", ["yudhishthira", "shakuni", "duryodhana", "dushasana", "draupadi", "karna", "bhishma", "drona", "vidura", "dhritarashtra"], 5),
    E("weapons", 5, "Arjuna wins divine weapons", "Arjuna goes to the Himalaya, wrestles Shiva in the guise of a hunter, and spends years in Indra’s heaven learning celestial weapons.", "himalaya", ["arjuna"], 6),
    E("yaksha", 11.9, "The yaksha’s questions", "At a lake that kills whoever drinks without answering its guardian, Yudhishthira answers the yaksha’s riddles and wins back his brothers’ lives.", "kamyaka", ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva"], 6),
    E("kichaka", 12.8, "Kichaka is killed", "Bhima, disguised as a cook, kills the general Kichaka for harassing Draupadi.", "virata", ["bhima", "draupadi"], 7),
    E("cattle-raid", 13, "The cattle raid", "The Kauravas raid Matsya’s herds. Arjuna, still in disguise, drives the whole Kaurava force back as the thirteenth year ends.", "virata", ["arjuna", "duryodhana", "karna", "bhishma", "drona"], 7),
    E("wedding", 13.1, "Abhimanyu marries Uttara", "Arjuna’s son marries Virata’s daughter, sealing the alliance with Matsya.", "virata", ["abhimanyu", "uttara", "virata", "arjuna"], 7),
    E("choice", 13.3, "Krishna or his army", "Arjuna and Duryodhana both come to Krishna. Arjuna chooses Krishna, unarmed; Duryodhana takes his army.", "dwaraka", ["arjuna", "duryodhana", "krishna"], 8),
    E("peace", 13.45, "The last peace mission", "Krishna asks the Kaurava court for five villages and is refused. Afterward he tells Karna who his mother is; Karna stays loyal to Duryodhana.", "hastinapura", ["krishna", "duryodhana", "dhritarashtra", "karna", "bhishma", "vidura"], 8),
    E("gita", W(1), "The Bhagavad Gita", "Facing his teachers and cousins across the field, Arjuna drops his bow. Krishna’s answer becomes the Bhagavad Gita.", "kurukshetra", ["krishna", "arjuna"], 9, { day: 1 }),
    E("bhishma-falls", W(10), "Bhishma falls", "Shooting from behind Shikhandi, whom Bhishma will not fight, Arjuna brings Bhishma down onto a bed of arrows.", "kurukshetra", ["bhishma", "arjuna", "shikhandi"], 9, { day: 10 }),
    E("chakravyuha", W(13), "The Chakravyuha", "Abhimanyu breaks into Drona’s wheel formation but cannot get out. Jayadratha blocks his brothers, and he is killed.", "kurukshetra", ["abhimanyu", "drona", "jayadratha", "karna"], 9, { day: 13 }),
    E("jayadratha", W(14), "Jayadratha is killed", "Arjuna vows to kill Jayadratha by sunset or burn himself, and does it at the last light.", "kurukshetra", ["arjuna", "jayadratha", "krishna"], 9, { day: 14 }),
    E("ghatotkacha", W(14.5), "Ghatotkacha’s night", "Fighting by night, Ghatotkacha wrecks the Kaurava ranks until Karna uses the divine spear he was saving for Arjuna.", "kurukshetra", ["ghatotkacha", "karna"], 9, { day: 14 }),
    E("drona-dies", W(15), "Drona dies", "Drupada and Virata fall to Drona. Then Yudhishthira tells him “Ashwatthama is dead”, meaning an elephant of that name; Drona lays down his arms and Dhrishtadyumna kills him.", "kurukshetra", ["drona", "dhrishtadyumna", "yudhishthira", "drupada", "virata"], 9, { day: 15 }),
    E("dushasana", W(16), "Dushasana is killed", "Bhima kills Dushasana, keeping the vow he made in the dice hall.", "kurukshetra", ["bhima", "dushasana"], 9, { day: 16 }),
    E("karna-dies", W(17), "Karna dies", "Karna’s chariot wheel sinks into the ground, and Arjuna kills him while he tries to free it.", "kurukshetra", ["karna", "arjuna", "krishna", "shalya"], 9, { day: 17 }),
    E("last-day", W(18), "The last day", "Yudhishthira kills Shalya, Sahadeva kills Shakuni, and Bhima breaks Duryodhana’s thigh in a mace duel.", "kurukshetra", ["shalya", "yudhishthira", "shakuni", "sahadeva", "duryodhana", "bhima"], 9, { day: 18 }),
    E("night-raid", W(18.5), "The night raid", "Ashwatthama, with Kripa and Kritavarma, slips into the Pandava camp and kills the sleeping Dhrishtadyumna, Shikhandi and Draupadi’s five sons.", "kurukshetra", ["ashwatthama", "kripa", "dhrishtadyumna", "shikhandi", "upapandavas"], 9, { day: 18 }),
    E("coronation", 13.7, "Yudhishthira is crowned", "Grieving, Yudhishthira is crowned at Hastinapura.", "hastinapura", ["yudhishthira", "krishna", "dhritarashtra"], 10),
    E("bhishma-dies", 13.8, "Bhishma dies", "After teaching Yudhishthira on duty and kingship from his bed of arrows, Bhishma dies at the winter solstice.", "kurukshetra", ["bhishma", "yudhishthira", "krishna"], 10),
    E("parikshit-born", 13.9, "Parikshit is born", "Abhimanyu’s son is born dead, struck by Ashwatthama’s weapon in the womb, and Krishna revives him.", "hastinapura", ["parikshit", "uttara", "krishna"], 10),
    E("forest-retreat", 28.6, "The elders leave for the forest", "Fifteen years after the war, Dhritarashtra, Gandhari and Kunti leave the palace to live as ascetics. Vidura goes too.", null, ["dhritarashtra", "gandhari", "kunti", "vidura"], 10),
    E("forest-fire", 31, "The forest fire", "Dhritarashtra, Gandhari and Kunti die in a forest fire.", null, ["dhritarashtra", "gandhari", "kunti"], 10),
    E("yadavas", 49.6, "The end of the Yadavas", "Thirty-six years after the war, the Yadavas destroy one another in a drunken brawl. Krishna is killed by a hunter’s arrow, and the sea swallows Dwarka.", "dwaraka", ["krishna", "balarama"], 10),
    E("final-journey", 50.1, "The final journey", "The Pandavas crown Parikshit and walk toward the Himalaya. Draupadi falls first, then Sahadeva, Nakula, Arjuna and Bhima. Yudhishthira, followed by a dog, reaches heaven.", "himalaya", ["yudhishthira", "bhima", "arjuna", "nakula", "sahadeva", "draupadi", "parikshit"], 10),
    E("parikshit-dies", 73.9, "Parikshit dies", "Cursed by a sage’s son, King Parikshit is killed by the serpent Takshaka.", "hastinapura", ["parikshit"], 10),
    E("recital", 80, "The story is told", "At Janamejaya’s snake sacrifice, Vyasa’s student Vaishampayana tells the story of the king’s great-grandfathers. Much of the Mahabharata is framed as this telling.", null, ["janamejaya", "vyasa"], 10),
  ];
  MB.byEvent = Object.fromEntries(MB.events.map(e => [e.id, e]));

  /* ---------- the story's place in real history ---------- */
  MB.history = {
    note: "Tradition and history give very different answers. Many traditional reckonings place the war in 3138 BCE and the start of the Kali Yuga, the present age, in 3102 BCE, around Krishna’s death. Historians who think a real conflict lies behind the story usually put it around 1000 BCE, and date the composition of the text as we have it to roughly 400 BCE–400 CE.",
    items: [
      { label: "The war, traditional dating", from: -3138, to: -3138, kind: "trad" },
      { label: "Kali Yuga begins, traditional dating", from: -3102, to: -3102, kind: "trad" },
      { label: "The war, a common historians’ estimate", from: -1200, to: -800, kind: "hist" },
      { label: "The text takes shape", from: -400, to: 400, kind: "text" },
      { label: "Today", from: 2026, to: 2026, kind: "now" },
    ],
    yugas: "In the traditional cosmology, the four ages (yugas) run 1,728,000, 1,296,000, 864,000 and 432,000 years. The Mahabharata sits at the very end of the third age, the Dvapara, and the hinge into the Kali.",
  };

  MB.caveats = [
    "Several sites are traditional identifications, not archaeological certainties. Ekachakra is disputed: it is shown at Chakarnagar near Etawah; the other main candidate is Ekchakra in Birbhum, West Bengal. Kamyaka’s location is also traditional.",
    "The Pandavas’ final journey circles east, south and west before turning north. The map simplifies it to Hastinapura, Dwarka and the Himalaya.",
    "Versions of the epic differ in their details. This follows the broad Sanskrit tradition, retold in original words.",
    "The epic gives few dates, so all ages and spans are approximate reconstructions counted from the game of dice.",
  ];
})();
