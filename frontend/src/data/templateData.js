export const TEMPLATE_RESULT = {
  phase1: {
    drawing_type: 'Machined + welded hybrid',
    reason: 'Welds exceed 10% of features. Both machining and welding review scope activated.',
    review_scope: ['TOLERANCES', 'GD&T', 'WELDS', 'MATERIAL', 'SURFACE FINISH', 'ASSEMBLY SEQUENCE'],
    excluded: ['CASTING SPECS', 'FORGING SPECS'],
  },
  phase2: {
    issues: [
      {
        id: 'T001',
        category: 'TOLERANCES',
        red_flag: 'RF-T1',
        severity: 'CRITICAL',
        issue: 'Missing general tolerance block',
        description:
          'No “unless otherwise specified” tolerance note found in title block or drawing notes. All untoleranced dimensions are undefined — the manufacturer cannot establish a baseline.',
        location: 'Title block',
        recommendation: 'Add: “UOS: ±0.030” to title block or general notes',
        impact_badge: 'Blocks manufacturing',
        why_it_matters:
          'Without a general tolerance, every untoleranced dimension is open to interpretation. Different shops will assume different values — guaranteeing non-conformance.',
        cost: null,
      },
      {
        id: 'G001',
        category: 'GD&T',
        red_flag: 'RF-G2',
        severity: 'CRITICAL',
        issue: 'Datum A undefined — no triangle symbol on any view',
        description:
          'GD&T concentricity callout references “Datum A” but no datum triangle symbol appears on the front view, section A-A, or auxiliary views. Fixture setup is impossible.',
        location: 'Section A-A · concentricity FCF',
        recommendation:
          'Add datum triangle to bore centerline on front view. Confirm primary datum hierarchy.',
        impact_badge: 'Non-conforming parts risk',
        why_it_matters:
          'The manufacturer cannot set up a fixture without a defined datum. Parts will be machined off an assumed reference — almost certainly wrong.',
        cost: null,
      },
      {
        id: 'T002',
        category: 'TOLERANCES',
        red_flag: 'RF-T2',
        severity: 'HIGH',
        issue: 'Bearing bore Ø1.250″ relies on loose general tolerance',
        description:
          'Critical bearing bore uses only the general ±0.030” tolerance. Standard H7 bearing fit requires ±0.0005”. At ±0.030”, no bearing will seat correctly.',
        location: 'Sheet 2 · detail view D',
        recommendation:
          'Specify: Ø1.2500” +0.0005”/-0.0000” with Ra 32 surface finish',
        impact_badge: '~$80/unit rework',
        why_it_matters: null,
        cost: '$80',
      },
      {
        id: 'W001',
        category: 'WELDS',
        red_flag: 'RF-W4',
        severity: 'HIGH',
        issue: 'Weld process not specified — MIG vs TIG unresolved',
        description:
          'Weld symbols are present on the flange-to-body joint but no welding process (MIG, TIG, SMAW) is called out. Cost, quality, and inspection criteria differ significantly between processes.',
        location: 'Sheet 4 · weld detail W3',
        recommendation:
          'Add process flag: GTAW (TIG) recommended for stainless pressure-boundary weld',
        impact_badge: '$30–$150/weld delta',
        why_it_matters: null,
        cost: '$90',
      },
      {
        id: 'A001',
        category: 'ASSEMBLY SEQUENCE',
        red_flag: 'RF-A2 · RF-A6',
        severity: 'CRITICAL',
        issue: 'Critical bore dimensioned before weld heat — no re-machine step',
        description:
          'Sequence shows Ø2.500” bore finished to tolerance at step 3, then body welded at step 6. Weld heat will distort the bore. No re-machining step is specified after welding.',
        location: 'Manufacturing notes · steps 3–6',
        recommendation:
          'Move bore finish to after stress relief (step 8), or add re-bore step at step 9',
        impact_badge: '~$200/unit scrap risk',
        why_it_matters:
          'Weld heat at 1400–1600°F causes thermal distortion in any nearby precision bore. A bore finished before welding will almost certainly be out of tolerance after it.',
        cost: '$200',
      },
      {
        id: 'W002',
        category: 'WELDS',
        red_flag: 'RF-W5',
        severity: 'HIGH',
        issue: 'Filler material not specified for SA-516-70 body',
        description:
          'No filler rod or electrode designation on any weld callout. For SA-516-70 carbon steel pressure vessel service, filler must match or exceed base metal strength.',
        location: 'General weld notes',
        recommendation: 'Specify ER70S-2 (GTAW) or E7018 (SMAW). Add to weld note table.',
        impact_badge: 'Material traceability risk',
        why_it_matters: null,
        cost: null,
      },
      {
        id: 'S001',
        category: 'SURFACE FINISH',
        red_flag: 'RF-S2',
        severity: 'MEDIUM',
        issue: 'Ra 4 applied globally — over-specified on envelope surfaces',
        description:
          'Drawing applies Ra 4 (32 µin) to all surfaces via the general finish note. External envelope faces have no sealing or mating function and can tolerate Ra 125 — reducing grinding scope significantly.',
        location: 'General notes · surface finish symbol',
        recommendation: 'Restrict Ra 4 to bore ID + seal face. Set general finish to Ra 125.',
        impact_badge: '~$25/unit savings',
        why_it_matters: null,
        cost: '-$25',
      },
      {
        id: 'A002',
        category: 'ASSEMBLY SEQUENCE',
        red_flag: 'RF-H2 · RF-H3',
        severity: 'HIGH',
        issue: 'Heat treatment temperature and duration not specified',
        description:
          '“Stress relieve after welding” is noted but no temperature or hold time is given. For SA-516-70, ASME PCC-2 requires 1100°F minimum for 1 hr/inch of thickness.',
        location: 'Manufacturing notes · step 7',
        recommendation:
          'Add: “PWHT at 1150°F ±25°F, hold 2 hrs, furnace cool to 400°F, air cool”',
        impact_badge: 'Code compliance risk',
        why_it_matters: null,
        cost: null,
      },
      {
        id: 'M001',
        category: 'MATERIAL',
        red_flag: 'RF-M3',
        severity: 'MEDIUM',
        issue: 'Material condition not stated — annealed vs cold-drawn undefined',
        description:
          'SA-516-70 plate is specified but condition (normalized, hot-rolled, PWHT) is not. Affects machinability and pre-existing stress state going into weld sequence.',
        location: 'Title block · material field',
        recommendation:
          'Add: “SA-516-70 normalized per ASME Sec. II Part A” to title block',
        impact_badge: 'Machinability variance',
        why_it_matters: null,
        cost: null,
      },
    ],
    quality_scores: {
      TOLERANCES: 40,
      'GD&T': 55,
      WELDS: 50,
      MATERIAL: 80,
      'SURFACE FINISH': 60,
      OVERALL: 54,
    },
    summary: {
      total_issues: 9,
      critical_count: 2,
      high_count: 4,
      medium_count: 3,
      low_count: 0,
      total_cost_impact: '$580',
      recommendation: 'REVISE AND RESUBMIT',
      key_action_items: [
        'Add general tolerance block to title block (T001) — immediate',
        'Define Datum A with triangle symbol on front view (G001) — immediate',
        'Move Ø2.500” bore finish to after PWHT in manufacturing sequence (A001)',
        'Add bearing bore explicit tolerance ±0.0005” on detail view D (T002)',
        'Specify weld process + filler material in weld note table (W001, W002)',
      ],
    },
  },
}
