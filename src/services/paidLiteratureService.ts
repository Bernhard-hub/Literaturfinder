// Paid Literature Service - Bezahlte akademische Quellen mit Zugangs-Lösungen
// Elsevier, Wiley, Springer (paid), Taylor & Francis, SAGE, De Gruyter, etc.
// + OpenURL Resolver, Unpaywall API, Library Genesis

export interface PaidPaper {
  id: string
  title: string
  authors: string
  year: number
  journal?: string
  publisher: string
  doi?: string
  abstract?: string
  url: string
  isPaid: boolean
  // Access solutions
  openAccessUrl?: string      // Via Unpaywall
  institutionalUrl?: string   // Via OpenURL Resolver
  libgenUrl?: string          // Via Library Genesis
  unpaywall?: UnpaywallResult
}

export interface UnpaywallResult {
  is_oa: boolean
  best_oa_location?: {
    url: string
    url_for_pdf?: string
    version: string
    license?: string
    host_type: string
  }
  oa_status: 'gold' | 'green' | 'hybrid' | 'bronze' | 'closed'
}

export interface OpenURLConfig {
  baseUrl: string           // z.B. "https://resolver.uni-graz.at/openurl"
  institutionId?: string
  apiKey?: string
}

export interface LibGenResult {
  id: string
  title: string
  author: string
  year: string
  md5: string
  extension: string
  filesize: number
  mirror1?: string
  mirror2?: string
  mirror3?: string
}

// ============================================
// PAID LITERATURE SERVICE
// ============================================

export class PaidLiteratureService {
  private openUrlConfig: OpenURLConfig | null = null

  // ============================================
  // CROSSREF API - Hauptquelle für DOI/Metadaten
  // ============================================

  async searchCrossRef(query: string, maxResults = 20): Promise<PaidPaper[]> {
    try {
      // CrossRef API - ohne User-Agent Header (Browser erlaubt das nicht)
      // Stattdessen mailto als Query-Parameter fuer "polite pool"
      const response = await fetch(
        `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${maxResults}&sort=relevance&order=desc&mailto=literaturfinder@evidenra.com`
      )

      if (!response.ok) {
        console.error(`CrossRef API responded with status: ${response.status}`)
        throw new Error(`CrossRef API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('CrossRef response:', data.message?.['total-results'], 'total results')
      const items = data.message?.items || []

      return items.map((item: any) => ({
        id: `crossref-${item.DOI || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: item.title?.[0] || 'Unknown Title',
        authors: item.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).join(', ') || 'Unknown',
        year: item.published?.['date-parts']?.[0]?.[0] || item.created?.['date-parts']?.[0]?.[0] || 0,
        journal: item['container-title']?.[0] || '',
        publisher: item.publisher || 'Unknown Publisher',
        doi: item.DOI,
        abstract: item.abstract?.replace(/<[^>]*>/g, '') || '', // Strip HTML
        url: item.URL || `https://doi.org/${item.DOI}`,
        isPaid: !item['is-referenced-by-count'] // Rough estimate
      }))
    } catch (error) {
      console.error('CrossRef search error:', error)
      return []
    }
  }

  // ============================================
  // OPENURL RESOLVER - Institutioneller Zugang
  // ============================================

  setOpenURLConfig(config: OpenURLConfig) {
    this.openUrlConfig = config
    console.log(`🏛️ OpenURL Resolver configured: ${config.baseUrl}`)
  }

  generateOpenURL(paper: PaidPaper): string | null {
    if (!this.openUrlConfig) {
      return null
    }

    const params = new URLSearchParams()

    // OpenURL 1.0 Standard Parameters
    params.set('url_ver', 'Z39.88-2004')
    params.set('url_ctx_fmt', 'info:ofi/fmt:kev:mtx:ctx')
    params.set('rft_val_fmt', 'info:ofi/fmt:kev:mtx:journal')

    if (paper.doi) {
      params.set('rft_id', `info:doi/${paper.doi}`)
    }

    if (paper.title) {
      params.set('rft.atitle', paper.title)
    }

    if (paper.journal) {
      params.set('rft.jtitle', paper.journal)
    }

    if (paper.authors) {
      const firstAuthor = paper.authors.split(',')[0].trim()
      const parts = firstAuthor.split(' ')
      if (parts.length > 1) {
        params.set('rft.aulast', parts[parts.length - 1])
        params.set('rft.aufirst', parts.slice(0, -1).join(' '))
      }
    }

    if (paper.year) {
      params.set('rft.date', paper.year.toString())
    }

    return `${this.openUrlConfig.baseUrl}?${params.toString()}`
  }

  // Common University OpenURL Resolvers - INTERNATIONAL
  static readonly KNOWN_RESOLVERS: Record<string, OpenURLConfig> = {
    // ═══════════════════════════════════════
    // 🇦🇹 AUSTRIA
    // ═══════════════════════════════════════
    'uni-graz': {
      baseUrl: 'https://resolver.uni-graz.at/openurl',
      institutionId: 'uni-graz'
    },
    'uni-wien': {
      baseUrl: 'https://resolver.obvsg.at/resolver',
      institutionId: 'uni-wien'
    },
    'tu-wien': {
      baseUrl: 'https://resolver.obvsg.at/resolver',
      institutionId: 'tu-wien'
    },
    'uni-innsbruck': {
      baseUrl: 'https://resolver.obvsg.at/resolver',
      institutionId: 'uni-innsbruck'
    },
    'uni-salzburg': {
      baseUrl: 'https://resolver.obvsg.at/resolver',
      institutionId: 'uni-salzburg'
    },
    'uni-linz': {
      baseUrl: 'https://resolver.obvsg.at/resolver',
      institutionId: 'jku'
    },
    'uni-klagenfurt': {
      baseUrl: 'https://resolver.obvsg.at/resolver',
      institutionId: 'uni-klagenfurt'
    },

    // ═══════════════════════════════════════
    // 🇩🇪 GERMANY
    // ═══════════════════════════════════════
    'hu-berlin': {
      baseUrl: 'https://sfx.kobv.de/sfx_hub',
      institutionId: 'hub'
    },
    'fu-berlin': {
      baseUrl: 'https://sfx.kobv.de/sfx_fub',
      institutionId: 'fub'
    },
    'tu-berlin': {
      baseUrl: 'https://sfx.kobv.de/sfx_tub',
      institutionId: 'tub'
    },
    'lmu-muenchen': {
      baseUrl: 'https://sfx.bsb-muenchen.de/sfx_ubm',
      institutionId: 'ubm'
    },
    'tum': {
      baseUrl: 'https://sfx.bsb-muenchen.de/sfx_tum',
      institutionId: 'tum'
    },
    'uni-heidelberg': {
      baseUrl: 'https://sfx.ub.uni-heidelberg.de/sfx_uhei',
      institutionId: 'uhei'
    },
    'uni-freiburg': {
      baseUrl: 'https://sfx.bsz-bw.de/sfx_ubfr',
      institutionId: 'ubfr'
    },
    'uni-koeln': {
      baseUrl: 'https://sfx.hbz-nrw.de/sfx_ubk',
      institutionId: 'ubk'
    },
    'uni-bonn': {
      baseUrl: 'https://sfx.hbz-nrw.de/sfx_ubb',
      institutionId: 'ubb'
    },
    'uni-goettingen': {
      baseUrl: 'https://sfx.gbv.de/sfx_subgoe',
      institutionId: 'subgoe'
    },
    'uni-hamburg': {
      baseUrl: 'https://sfx.gbv.de/sfx_subhh',
      institutionId: 'subhh'
    },
    'rwth-aachen': {
      baseUrl: 'https://sfx.hbz-nrw.de/sfx_rwthaachen',
      institutionId: 'rwth'
    },

    // ═══════════════════════════════════════
    // 🇨🇭 SWITZERLAND
    // ═══════════════════════════════════════
    'eth-zurich': {
      baseUrl: 'https://sfx.ethz.ch/sfx_ethz',
      institutionId: 'eth'
    },
    'uni-zurich': {
      baseUrl: 'https://www.recherche-portal.ch/ZAD:default_scope',
      institutionId: 'uzh'
    },
    'uni-bern': {
      baseUrl: 'https://sfx.ethz.ch/sfx_unibe',
      institutionId: 'unibe'
    },
    'uni-basel': {
      baseUrl: 'https://sfx.ethz.ch/sfx_unibas',
      institutionId: 'unibas'
    },
    'epfl': {
      baseUrl: 'https://sfx.ethz.ch/sfx_epfl',
      institutionId: 'epfl'
    },
    'uni-geneve': {
      baseUrl: 'https://sfx.ethz.ch/sfx_unige',
      institutionId: 'unige'
    },

    // ═══════════════════════════════════════
    // 🇺🇸 USA
    // ═══════════════════════════════════════
    'harvard': {
      baseUrl: 'https://sfx.hul.harvard.edu/sfx_local',
      institutionId: 'harvard'
    },
    'mit': {
      baseUrl: 'https://sfx.mit.edu/sfx_local',
      institutionId: 'mit'
    },
    'stanford': {
      baseUrl: 'https://stanford.idm.oclc.org/login?url=',
      institutionId: 'stanford'
    },
    'berkeley': {
      baseUrl: 'https://sfx.lib.berkeley.edu/sfx_local',
      institutionId: 'berkeley'
    },
    'yale': {
      baseUrl: 'https://sfx.library.yale.edu/sfx_local',
      institutionId: 'yale'
    },
    'princeton': {
      baseUrl: 'https://getit.princeton.edu/sfx_local',
      institutionId: 'princeton'
    },
    'columbia': {
      baseUrl: 'https://resolver.library.columbia.edu/sfx_local',
      institutionId: 'columbia'
    },
    'nyu': {
      baseUrl: 'https://getit.library.nyu.edu/sfx_local',
      institutionId: 'nyu'
    },
    'uchicago': {
      baseUrl: 'https://sfx.lib.uchicago.edu/sfx_local',
      institutionId: 'uchicago'
    },
    'ucla': {
      baseUrl: 'https://uclid.ucla.edu/sfx_local',
      institutionId: 'ucla'
    },
    'umich': {
      baseUrl: 'https://sfx.lib.umich.edu/sfx_local',
      institutionId: 'umich'
    },
    'upenn': {
      baseUrl: 'https://sfx.library.upenn.edu/sfx_local',
      institutionId: 'upenn'
    },
    'cornell': {
      baseUrl: 'https://resolver.library.cornell.edu/sfx_local',
      institutionId: 'cornell'
    },
    'duke': {
      baseUrl: 'https://sfx.lib.duke.edu/sfx_local',
      institutionId: 'duke'
    },
    'jhu': {
      baseUrl: 'https://sfx.library.jhu.edu/sfx_local',
      institutionId: 'jhu'
    },

    // ═══════════════════════════════════════
    // 🇬🇧 UK
    // ═══════════════════════════════════════
    'oxford': {
      baseUrl: 'https://solo.bodleian.ox.ac.uk/openurl',
      institutionId: 'oxford'
    },
    'cambridge': {
      baseUrl: 'https://librarysearch.lib.cam.ac.uk/openurl',
      institutionId: 'cambridge'
    },
    'ucl': {
      baseUrl: 'https://ucl-new-primo.hosted.exlibrisgroup.com/openurl',
      institutionId: 'ucl'
    },
    'imperial': {
      baseUrl: 'https://imperial.alma.exlibrisgroup.com/openurl',
      institutionId: 'imperial'
    },
    'lse': {
      baseUrl: 'https://lse.alma.exlibrisgroup.com/openurl',
      institutionId: 'lse'
    },
    'edinburgh': {
      baseUrl: 'https://discovered.ed.ac.uk/openurl',
      institutionId: 'edinburgh'
    },
    'manchester': {
      baseUrl: 'https://man.alma.exlibrisgroup.com/openurl',
      institutionId: 'manchester'
    },
    'kings': {
      baseUrl: 'https://kcl.alma.exlibrisgroup.com/openurl',
      institutionId: 'kcl'
    },

    // ═══════════════════════════════════════
    // 🇳🇱 NETHERLANDS
    // ═══════════════════════════════════════
    'uva': {
      baseUrl: 'https://uba.uva.nl/resolver',
      institutionId: 'uva'
    },
    'leiden': {
      baseUrl: 'https://catalogue.leidenuniv.nl/openurl',
      institutionId: 'leiden'
    },
    'utrecht': {
      baseUrl: 'https://catalogue.library.uu.nl/openurl',
      institutionId: 'utrecht'
    },
    'delft': {
      baseUrl: 'https://tudelft.alma.exlibrisgroup.com/openurl',
      institutionId: 'tudelft'
    },
    'erasmus': {
      baseUrl: 'https://eur.alma.exlibrisgroup.com/openurl',
      institutionId: 'eur'
    },

    // ═══════════════════════════════════════
    // 🇸🇪🇳🇴🇩🇰🇫🇮 SCANDINAVIA
    // ═══════════════════════════════════════
    'kth': {
      baseUrl: 'https://kth-primo.hosted.exlibrisgroup.com/openurl',
      institutionId: 'kth'
    },
    'su-stockholm': {
      baseUrl: 'https://su-se-primo.hosted.exlibrisgroup.com/openurl',
      institutionId: 'su'
    },
    'lund': {
      baseUrl: 'https://lubcat.lub.lu.se/openurl',
      institutionId: 'lund'
    },
    'uio-oslo': {
      baseUrl: 'https://bibsys-almaprimo.hosted.exlibrisgroup.com/openurl',
      institutionId: 'uio'
    },
    'ku-copenhagen': {
      baseUrl: 'https://soeg.kb.dk/openurl',
      institutionId: 'ku'
    },
    'helsinki': {
      baseUrl: 'https://helka.helsinki.fi/openurl',
      institutionId: 'helsinki'
    },
    'aalto': {
      baseUrl: 'https://aalto.alma.exlibrisgroup.com/openurl',
      institutionId: 'aalto'
    },

    // ═══════════════════════════════════════
    // 🇫🇷 FRANCE
    // ═══════════════════════════════════════
    'sorbonne': {
      baseUrl: 'https://catalogue.bu.sorbonne-universite.fr/openurl',
      institutionId: 'sorbonne'
    },
    'ens-paris': {
      baseUrl: 'https://catalogue.ens.fr/openurl',
      institutionId: 'ens'
    },
    'polytechnique': {
      baseUrl: 'https://catalogue.polytechnique.fr/openurl',
      institutionId: 'polytechnique'
    },
    'sciences-po': {
      baseUrl: 'https://catalogue.sciencespo.fr/openurl',
      institutionId: 'sciencespo'
    },

    // ═══════════════════════════════════════
    // 🇪🇸 SPAIN
    // ═══════════════════════════════════════
    'ub-barcelona': {
      baseUrl: 'https://cercabib.ub.edu/openurl',
      institutionId: 'ub'
    },
    'uam-madrid': {
      baseUrl: 'https://biblioteca.uam.es/openurl',
      institutionId: 'uam'
    },
    'uc3m': {
      baseUrl: 'https://uc3m.alma.exlibrisgroup.com/openurl',
      institutionId: 'uc3m'
    },

    // ═══════════════════════════════════════
    // 🇮🇹 ITALY
    // ═══════════════════════════════════════
    'polimi': {
      baseUrl: 'https://polimi.alma.exlibrisgroup.com/openurl',
      institutionId: 'polimi'
    },
    'sapienza': {
      baseUrl: 'https://uniroma1.alma.exlibrisgroup.com/openurl',
      institutionId: 'sapienza'
    },
    'unibo': {
      baseUrl: 'https://unibo.alma.exlibrisgroup.com/openurl',
      institutionId: 'unibo'
    },

    // ═══════════════════════════════════════
    // 🇨🇦 CANADA
    // ═══════════════════════════════════════
    'toronto': {
      baseUrl: 'https://search.library.utoronto.ca/openurl',
      institutionId: 'utoronto'
    },
    'ubc': {
      baseUrl: 'https://resolve.library.ubc.ca/openurl',
      institutionId: 'ubc'
    },
    'mcgill': {
      baseUrl: 'https://mcgill.alma.exlibrisgroup.com/openurl',
      institutionId: 'mcgill'
    },
    'ualberta': {
      baseUrl: 'https://library.ualberta.ca/openurl',
      institutionId: 'ualberta'
    },
    'waterloo': {
      baseUrl: 'https://uwaterloo.alma.exlibrisgroup.com/openurl',
      institutionId: 'waterloo'
    },

    // ═══════════════════════════════════════
    // 🇦🇺 AUSTRALIA
    // ═══════════════════════════════════════
    'sydney': {
      baseUrl: 'https://sydney.alma.exlibrisgroup.com/openurl',
      institutionId: 'sydney'
    },
    'melbourne': {
      baseUrl: 'https://unimelb.alma.exlibrisgroup.com/openurl',
      institutionId: 'melbourne'
    },
    'anu': {
      baseUrl: 'https://anu.alma.exlibrisgroup.com/openurl',
      institutionId: 'anu'
    },
    'unsw': {
      baseUrl: 'https://unsw.alma.exlibrisgroup.com/openurl',
      institutionId: 'unsw'
    },
    'monash': {
      baseUrl: 'https://monash.alma.exlibrisgroup.com/openurl',
      institutionId: 'monash'
    },

    // ═══════════════════════════════════════
    // 🇯🇵🇨🇳🇸🇬🇭🇰 ASIA
    // ═══════════════════════════════════════
    'tokyo': {
      baseUrl: 'https://opac.dl.itc.u-tokyo.ac.jp/openurl',
      institutionId: 'utokyo'
    },
    'kyoto': {
      baseUrl: 'https://kuline.kulib.kyoto-u.ac.jp/openurl',
      institutionId: 'kyoto'
    },
    'tsinghua': {
      baseUrl: 'https://lib.tsinghua.edu.cn/openurl',
      institutionId: 'tsinghua'
    },
    'peking': {
      baseUrl: 'https://www.lib.pku.edu.cn/openurl',
      institutionId: 'pku'
    },
    'nus': {
      baseUrl: 'https://linc.nus.edu.sg/openurl',
      institutionId: 'nus'
    },
    'ntu-singapore': {
      baseUrl: 'https://ntu.alma.exlibrisgroup.com/openurl',
      institutionId: 'ntu'
    },
    'hku': {
      baseUrl: 'https://hku.alma.exlibrisgroup.com/openurl',
      institutionId: 'hku'
    },
    'cuhk': {
      baseUrl: 'https://cuhk.alma.exlibrisgroup.com/openurl',
      institutionId: 'cuhk'
    },
    'kaist': {
      baseUrl: 'https://library.kaist.ac.kr/openurl',
      institutionId: 'kaist'
    },
    'snu': {
      baseUrl: 'https://snu.alma.exlibrisgroup.com/openurl',
      institutionId: 'snu'
    }
  }

  // Get resolvers grouped by region
  static getResolversByRegion(): Record<string, string[]> {
    return {
      'austria': ['uni-graz', 'uni-wien', 'tu-wien', 'uni-innsbruck', 'uni-salzburg', 'uni-linz', 'uni-klagenfurt'],
      'germany': ['hu-berlin', 'fu-berlin', 'tu-berlin', 'lmu-muenchen', 'tum', 'uni-heidelberg', 'uni-freiburg', 'uni-koeln', 'uni-bonn', 'uni-goettingen', 'uni-hamburg', 'rwth-aachen'],
      'switzerland': ['eth-zurich', 'uni-zurich', 'uni-bern', 'uni-basel', 'epfl', 'uni-geneve'],
      'usa': ['harvard', 'mit', 'stanford', 'berkeley', 'yale', 'princeton', 'columbia', 'nyu', 'uchicago', 'ucla', 'umich', 'upenn', 'cornell', 'duke', 'jhu'],
      'uk': ['oxford', 'cambridge', 'ucl', 'imperial', 'lse', 'edinburgh', 'manchester', 'kings'],
      'netherlands': ['uva', 'leiden', 'utrecht', 'delft', 'erasmus'],
      'scandinavia': ['kth', 'su-stockholm', 'lund', 'uio-oslo', 'ku-copenhagen', 'helsinki', 'aalto'],
      'france': ['sorbonne', 'ens-paris', 'polytechnique', 'sciences-po'],
      'spain': ['ub-barcelona', 'uam-madrid', 'uc3m'],
      'italy': ['polimi', 'sapienza', 'unibo'],
      'canada': ['toronto', 'ubc', 'mcgill', 'ualberta', 'waterloo'],
      'australia': ['sydney', 'melbourne', 'anu', 'unsw', 'monash'],
      'asia': ['tokyo', 'kyoto', 'tsinghua', 'peking', 'nus', 'ntu-singapore', 'hku', 'cuhk', 'kaist', 'snu']
    }
  }

  // Get display name for resolver
  static getResolverDisplayName(key: string): string {
    const names: Record<string, string> = {
      // Austria
      'uni-graz': 'Universität Graz',
      'uni-wien': 'Universität Wien',
      'tu-wien': 'TU Wien',
      'uni-innsbruck': 'Universität Innsbruck',
      'uni-salzburg': 'Universität Salzburg',
      'uni-linz': 'JKU Linz',
      'uni-klagenfurt': 'Universität Klagenfurt',
      // Germany
      'hu-berlin': 'HU Berlin',
      'fu-berlin': 'FU Berlin',
      'tu-berlin': 'TU Berlin',
      'lmu-muenchen': 'LMU München',
      'tum': 'TU München',
      'uni-heidelberg': 'Universität Heidelberg',
      'uni-freiburg': 'Universität Freiburg',
      'uni-koeln': 'Universität Köln',
      'uni-bonn': 'Universität Bonn',
      'uni-goettingen': 'Universität Göttingen',
      'uni-hamburg': 'Universität Hamburg',
      'rwth-aachen': 'RWTH Aachen',
      // Switzerland
      'eth-zurich': 'ETH Zürich',
      'uni-zurich': 'Universität Zürich',
      'uni-bern': 'Universität Bern',
      'uni-basel': 'Universität Basel',
      'epfl': 'EPFL Lausanne',
      'uni-geneve': 'Université de Genève',
      // USA
      'harvard': 'Harvard University',
      'mit': 'MIT',
      'stanford': 'Stanford University',
      'berkeley': 'UC Berkeley',
      'yale': 'Yale University',
      'princeton': 'Princeton University',
      'columbia': 'Columbia University',
      'nyu': 'New York University',
      'uchicago': 'University of Chicago',
      'ucla': 'UCLA',
      'umich': 'University of Michigan',
      'upenn': 'University of Pennsylvania',
      'cornell': 'Cornell University',
      'duke': 'Duke University',
      'jhu': 'Johns Hopkins University',
      // UK
      'oxford': 'University of Oxford',
      'cambridge': 'University of Cambridge',
      'ucl': 'UCL London',
      'imperial': 'Imperial College London',
      'lse': 'LSE',
      'edinburgh': 'University of Edinburgh',
      'manchester': 'University of Manchester',
      'kings': "King's College London",
      // Netherlands
      'uva': 'University of Amsterdam',
      'leiden': 'Leiden University',
      'utrecht': 'Utrecht University',
      'delft': 'TU Delft',
      'erasmus': 'Erasmus University Rotterdam',
      // Scandinavia
      'kth': 'KTH Stockholm',
      'su-stockholm': 'Stockholm University',
      'lund': 'Lund University',
      'uio-oslo': 'University of Oslo',
      'ku-copenhagen': 'University of Copenhagen',
      'helsinki': 'University of Helsinki',
      'aalto': 'Aalto University',
      // France
      'sorbonne': 'Sorbonne Université',
      'ens-paris': 'ENS Paris',
      'polytechnique': 'École Polytechnique',
      'sciences-po': 'Sciences Po',
      // Spain
      'ub-barcelona': 'Universitat de Barcelona',
      'uam-madrid': 'UAM Madrid',
      'uc3m': 'Universidad Carlos III',
      // Italy
      'polimi': 'Politecnico di Milano',
      'sapienza': 'Sapienza Roma',
      'unibo': 'Università di Bologna',
      // Canada
      'toronto': 'University of Toronto',
      'ubc': 'UBC Vancouver',
      'mcgill': 'McGill University',
      'ualberta': 'University of Alberta',
      'waterloo': 'University of Waterloo',
      // Australia
      'sydney': 'University of Sydney',
      'melbourne': 'University of Melbourne',
      'anu': 'Australian National University',
      'unsw': 'UNSW Sydney',
      'monash': 'Monash University',
      // Asia
      'tokyo': 'University of Tokyo',
      'kyoto': 'Kyoto University',
      'tsinghua': 'Tsinghua University',
      'peking': 'Peking University',
      'nus': 'NUS Singapore',
      'ntu-singapore': 'NTU Singapore',
      'hku': 'University of Hong Kong',
      'cuhk': 'CUHK Hong Kong',
      'kaist': 'KAIST',
      'snu': 'Seoul National University'
    }
    return names[key] || key
  }

  // ============================================
  // UNPAYWALL API - Legale Open Access Versionen
  // ============================================

  async checkUnpaywall(doi: string): Promise<UnpaywallResult | null> {
    try {
      // Unpaywall API - kostenlos, nur Email als Identifikation nötig
      const email = 'literaturfinder@evidenra.com'
      const response = await fetch(
        `https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=${email}`
      )

      if (!response.ok) {
        if (response.status === 404) {
          return { is_oa: false, oa_status: 'closed' }
        }
        throw new Error(`Unpaywall API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        is_oa: data.is_oa || false,
        best_oa_location: data.best_oa_location ? {
          url: data.best_oa_location.url,
          url_for_pdf: data.best_oa_location.url_for_pdf,
          version: data.best_oa_location.version,
          license: data.best_oa_location.license,
          host_type: data.best_oa_location.host_type
        } : undefined,
        oa_status: data.oa_status || 'closed'
      }
    } catch (error) {
      console.error('Unpaywall check error:', error)
      return null
    }
  }

  async enrichWithUnpaywall(papers: PaidPaper[]): Promise<PaidPaper[]> {
    const enrichedPapers: PaidPaper[] = []

    // Process in batches to avoid rate limiting
    for (const paper of papers) {
      if (paper.doi) {
        try {
          const unpaywall = await this.checkUnpaywall(paper.doi)

          enrichedPapers.push({
            ...paper,
            unpaywall: unpaywall || undefined,
            openAccessUrl: unpaywall?.best_oa_location?.url_for_pdf ||
                          unpaywall?.best_oa_location?.url,
            isPaid: !unpaywall?.is_oa
          })

          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch {
          enrichedPapers.push(paper)
        }
      } else {
        enrichedPapers.push(paper)
      }
    }

    return enrichedPapers
  }

  // ============================================
  // LIBRARY GENESIS - Grauzone (User Responsibility)
  // ============================================

  // WARNUNG: Library Genesis ist rechtlich umstritten
  // Diese Funktion generiert nur Links - der User entscheidet selbst

  generateLibGenSearchUrl(paper: PaidPaper): string {
    const query = paper.doi || paper.title
    // Verwende libgen.rs (aktueller Mirror)
    return `https://libgen.rs/scimag/?q=${encodeURIComponent(query)}`
  }

  async searchLibGen(query: string, maxResults = 20): Promise<LibGenResult[]> {
    // LibGen hat keine offizielle API - wir generieren nur Suchlinks
    // Der User muss selbst auf der Seite suchen
    console.warn('⚠️ Library Genesis: Keine direkte API. User muss manuell suchen.')

    return [{
      id: 'libgen-search',
      title: `Suche nach: ${query}`,
      author: '',
      year: '',
      md5: '',
      extension: '',
      filesize: 0,
      mirror1: `https://libgen.rs/scimag/?q=${encodeURIComponent(query)}`,
      mirror2: `https://libgen.is/scimag/?q=${encodeURIComponent(query)}`,
      mirror3: `https://libgen.st/scimag/?q=${encodeURIComponent(query)}`
    }]
  }

  // Generiere alle LibGen Mirror Links für ein Paper
  generateLibGenMirrors(paper: PaidPaper): string[] {
    const query = paper.doi || paper.title
    const encoded = encodeURIComponent(query)

    return [
      `https://libgen.rs/scimag/?q=${encoded}`,
      `https://libgen.is/scimag/?q=${encoded}`,
      `https://libgen.st/scimag/?q=${encoded}`,
      `https://sci-hub.se/${paper.doi || ''}`, // Sci-Hub Alternative
      `https://sci-hub.st/${paper.doi || ''}`
    ].filter(url => !url.endsWith('/'))
  }

  // ============================================
  // PUBLISHER-SPEZIFISCHE SUCHEN
  // ============================================

  // Elsevier / ScienceDirect (benötigt API Key für vollen Zugang)
  async searchScienceDirect(query: string, maxResults = 10): Promise<PaidPaper[]> {
    // ScienceDirect API benötigt API Key - hier nur DOI-basierte Suche via CrossRef
    const crossrefResults = await this.searchCrossRef(
      `${query} publisher:elsevier`,
      maxResults
    )

    return crossrefResults.map(paper => ({
      ...paper,
      publisher: 'Elsevier',
      url: paper.doi ? `https://www.sciencedirect.com/science/article/pii/${paper.doi.replace('/', '')}` : paper.url
    }))
  }

  // Wiley Online Library
  async searchWiley(query: string, maxResults = 10): Promise<PaidPaper[]> {
    const crossrefResults = await this.searchCrossRef(
      `${query} publisher:wiley`,
      maxResults
    )

    return crossrefResults.map(paper => ({
      ...paper,
      publisher: 'Wiley',
      url: paper.doi ? `https://onlinelibrary.wiley.com/doi/${paper.doi}` : paper.url
    }))
  }

  // Springer (kostenpflichtig)
  async searchSpringerPaid(query: string, maxResults = 10): Promise<PaidPaper[]> {
    const crossrefResults = await this.searchCrossRef(
      `${query} publisher:springer`,
      maxResults
    )

    return crossrefResults.map(paper => ({
      ...paper,
      publisher: 'Springer',
      url: paper.doi ? `https://link.springer.com/article/${paper.doi}` : paper.url
    }))
  }

  // Taylor & Francis
  async searchTaylorFrancis(query: string, maxResults = 10): Promise<PaidPaper[]> {
    const crossrefResults = await this.searchCrossRef(
      `${query} publisher:"taylor & francis"`,
      maxResults
    )

    return crossrefResults.map(paper => ({
      ...paper,
      publisher: 'Taylor & Francis',
      url: paper.doi ? `https://www.tandfonline.com/doi/full/${paper.doi}` : paper.url
    }))
  }

  // SAGE Publications
  async searchSage(query: string, maxResults = 10): Promise<PaidPaper[]> {
    const crossrefResults = await this.searchCrossRef(
      `${query} publisher:sage`,
      maxResults
    )

    return crossrefResults.map(paper => ({
      ...paper,
      publisher: 'SAGE Publications',
      url: paper.doi ? `https://journals.sagepub.com/doi/${paper.doi}` : paper.url
    }))
  }

  // De Gruyter
  async searchDeGruyter(query: string, maxResults = 10): Promise<PaidPaper[]> {
    const crossrefResults = await this.searchCrossRef(
      `${query} publisher:"de gruyter"`,
      maxResults
    )

    return crossrefResults.map(paper => ({
      ...paper,
      publisher: 'De Gruyter',
      url: paper.doi ? `https://www.degruyter.com/document/doi/${paper.doi}` : paper.url
    }))
  }

  // ============================================
  // MASTER SEARCH - Alle Quellen kombiniert
  // ============================================

  async searchAllPaidSources(query: string, options?: {
    includeUnpaywall?: boolean
    includeLibGen?: boolean
    maxPerSource?: number
  }): Promise<PaidPaper[]> {
    const {
      includeUnpaywall = true,
      includeLibGen = true,
      maxPerSource = 5
    } = options || {}

    console.log(`🔍 Searching paid literature for: "${query}"`)

    // Parallele Suche bei allen Publishern
    const [
      crossrefResults,
      elsevierResults,
      wileyResults,
      springerResults,
      taylorResults,
      sageResults,
      degruyterResults
    ] = await Promise.all([
      this.searchCrossRef(query, maxPerSource * 2),
      this.searchScienceDirect(query, maxPerSource),
      this.searchWiley(query, maxPerSource),
      this.searchSpringerPaid(query, maxPerSource),
      this.searchTaylorFrancis(query, maxPerSource),
      this.searchSage(query, maxPerSource),
      this.searchDeGruyter(query, maxPerSource)
    ])

    // Kombiniere und dedupliziere
    let allPapers = [
      ...crossrefResults,
      ...elsevierResults,
      ...wileyResults,
      ...springerResults,
      ...taylorResults,
      ...sageResults,
      ...degruyterResults
    ]

    // Entferne Duplikate basierend auf DOI oder Titel
    const seen = new Set<string>()
    allPapers = allPapers.filter(paper => {
      const key = paper.doi || paper.title.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    console.log(`📚 Found ${allPapers.length} paid papers`)

    // Enrichment mit Unpaywall
    if (includeUnpaywall) {
      console.log('🔓 Checking Unpaywall for open access versions...')
      allPapers = await this.enrichWithUnpaywall(allPapers)

      const oaCount = allPapers.filter(p => p.openAccessUrl).length
      console.log(`✅ Found ${oaCount} open access versions via Unpaywall`)
    }

    // LibGen Links hinzufügen
    if (includeLibGen) {
      allPapers = allPapers.map(paper => ({
        ...paper,
        libgenUrl: this.generateLibGenSearchUrl(paper)
      }))
    }

    // OpenURL hinzufügen wenn konfiguriert
    if (this.openUrlConfig) {
      allPapers = allPapers.map(paper => ({
        ...paper,
        institutionalUrl: this.generateOpenURL(paper) || undefined
      }))
    }

    return allPapers
  }

  // ============================================
  // EVIDENRA INTEGRATION - Export für Import
  // ============================================

  // Generiere Export-Format für EVIDENRA
  exportForEvidenra(papers: PaidPaper[]): string {
    return JSON.stringify({
      source: 'Literaturfinder',
      exportedAt: new Date().toISOString(),
      version: '1.0',
      papers: papers.map(paper => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        year: paper.year,
        journal: paper.journal,
        publisher: paper.publisher,
        doi: paper.doi,
        abstract: paper.abstract,
        url: paper.url,
        accessUrls: {
          original: paper.url,
          openAccess: paper.openAccessUrl,
          institutional: paper.institutionalUrl,
          libgen: paper.libgenUrl
        },
        metadata: {
          isPaid: paper.isPaid,
          unpaywallStatus: paper.unpaywall?.oa_status
        }
      }))
    }, null, 2)
  }

  // Generiere BibTeX für alle Papers
  exportBibTeX(papers: PaidPaper[]): string {
    return papers.map(paper => {
      const id = paper.doi?.replace(/[\/\.]/g, '_') || `paper_${Date.now()}`
      return `@article{${id},
  title = {${paper.title.replace(/[{}]/g, '')}},
  author = {${paper.authors}},
  year = {${paper.year}},
  journal = {${paper.journal || ''}},
  publisher = {${paper.publisher}},
  doi = {${paper.doi || ''}},
  url = {${paper.url}}
}`
    }).join('\n\n')
  }

  // ============================================
  // PDF DOWNLOAD SYSTEM - Automatischer Download
  // ============================================

  // Download Status Interface
  static createDownloadStatus() {
    return {
      total: 0,
      completed: 0,
      failed: 0,
      current: '',
      downloads: [] as { paper: PaidPaper; status: 'pending' | 'downloading' | 'completed' | 'failed' | 'no-pdf'; url?: string }[]
    }
  }

  // Finde beste PDF URL fuer ein Paper
  getBestPdfUrl(paper: PaidPaper): string | null {
    // Prioritaet: 1. Direkte PDF URL von Unpaywall, 2. Open Access URL, 3. arXiv PDF
    if (paper.unpaywall?.best_oa_location?.url_for_pdf) {
      return paper.unpaywall.best_oa_location.url_for_pdf
    }
    if (paper.openAccessUrl?.includes('.pdf')) {
      return paper.openAccessUrl
    }
    // Versuche arXiv PDF zu generieren
    if (paper.url?.includes('arxiv.org/abs/')) {
      return paper.url.replace('/abs/', '/pdf/') + '.pdf'
    }
    if (paper.openAccessUrl?.includes('arxiv.org/abs/')) {
      return paper.openAccessUrl.replace('/abs/', '/pdf/') + '.pdf'
    }
    // PMC PDF
    if (paper.openAccessUrl?.includes('ncbi.nlm.nih.gov/pmc/articles/')) {
      return paper.openAccessUrl + 'pdf/'
    }
    return paper.openAccessUrl || null
  }

  // Generiere sicheren Dateinamen
  sanitizeFilename(title: string, doi?: string): string {
    const base = title
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 80)
    const suffix = doi ? `_${doi.replace(/[\/\.]/g, '-')}` : ''
    return `${base}${suffix}.pdf`
  }

  // Download einzelnes PDF (oeffnet in neuem Tab - Browser-Limitierung)
  downloadSinglePdf(paper: PaidPaper): { success: boolean; url?: string; error?: string } {
    const pdfUrl = this.getBestPdfUrl(paper)

    if (!pdfUrl) {
      return { success: false, error: 'Keine PDF URL verfuegbar' }
    }

    // Browser kann PDFs nicht direkt speichern wegen CORS
    // Oeffne PDF in neuem Tab - User kann dann speichern
    window.open(pdfUrl, '_blank')

    return { success: true, url: pdfUrl }
  }

  // Batch Download - Oeffnet alle PDFs nacheinander
  async batchDownloadPdfs(
    papers: PaidPaper[],
    onProgress?: (status: ReturnType<typeof PaidLiteratureService.createDownloadStatus>) => void,
    delayMs = 1500
  ): Promise<ReturnType<typeof PaidLiteratureService.createDownloadStatus>> {
    const status = PaidLiteratureService.createDownloadStatus()
    status.total = papers.length
    status.downloads = papers.map(paper => ({ paper, status: 'pending' as const }))

    for (let i = 0; i < papers.length; i++) {
      const paper = papers[i]
      status.current = paper.title
      status.downloads[i].status = 'downloading'
      onProgress?.(status)

      const pdfUrl = this.getBestPdfUrl(paper)

      if (pdfUrl) {
        try {
          window.open(pdfUrl, '_blank')
          status.downloads[i].status = 'completed'
          status.downloads[i].url = pdfUrl
          status.completed++
        } catch {
          status.downloads[i].status = 'failed'
          status.failed++
        }
      } else {
        status.downloads[i].status = 'no-pdf'
        status.failed++
      }

      onProgress?.(status)

      // Verzoegerung zwischen Downloads um Browser nicht zu ueberlasten
      if (i < papers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }

    status.current = ''
    onProgress?.(status)
    return status
  }

  // Export mit vollstaendigen Abstracts und PDF Links
  exportFullData(papers: PaidPaper[]): string {
    return JSON.stringify({
      source: 'Literaturfinder',
      exportedAt: new Date().toISOString(),
      version: '2.0',
      totalPapers: papers.length,
      papersWithPdf: papers.filter(p => this.getBestPdfUrl(p)).length,
      papers: papers.map(paper => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        year: paper.year,
        journal: paper.journal,
        publisher: paper.publisher,
        doi: paper.doi,
        abstract: paper.abstract, // Vollstaendiges Abstract
        urls: {
          original: paper.url,
          openAccess: paper.openAccessUrl,
          pdf: this.getBestPdfUrl(paper),
          institutional: paper.institutionalUrl,
          libgen: paper.libgenUrl
        },
        accessInfo: {
          isPaid: paper.isPaid,
          oaStatus: paper.unpaywall?.oa_status,
          hasPdf: !!this.getBestPdfUrl(paper),
          pdfSource: paper.unpaywall?.best_oa_location?.host_type
        }
      }))
    }, null, 2)
  }

  // Generiere Download-Links Liste fuer externe Tools (wget, curl, etc.)
  generateDownloadList(papers: PaidPaper[]): string {
    const lines: string[] = [
      '# Literaturfinder PDF Download Liste',
      `# Generiert: ${new Date().toISOString()}`,
      `# Papers: ${papers.length}`,
      '#',
      '# Verwendung mit wget:',
      '# wget -i download-list.txt -P ./pdfs/',
      '#',
      ''
    ]

    papers.forEach(paper => {
      const pdfUrl = this.getBestPdfUrl(paper)
      if (pdfUrl) {
        lines.push(`# ${paper.title}`)
        lines.push(pdfUrl)
        lines.push('')
      }
    })

    return lines.join('\n')
  }
}

// Singleton Export
export const paidLiteratureService = new PaidLiteratureService()
