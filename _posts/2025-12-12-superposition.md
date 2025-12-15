---
layout: superposition 
title: "Superposition as Lossy Compression – Measure with Sparse Autoencoders and Connect to Adversarial Vulnerability"
description: "An information-theoretic framework quantifying superposition as lossy compression in neural networks. By measuring effective degrees of freedom through sparse autoencoders, we reveal that adversarial training's effect on feature organization depends on task complexity relative to network capacity."
tags: superposition, interpretability, adversarial-robustness, sparse-autoencoders
date: 2025-12-15
featured: false 

authors:
  - name: Leonard Bereska
    url: "https://leonardbereska.github.io/"
    affiliations:
      name: University of Amsterdam
  - name: Zoe Tzifa-Kratira
    affiliations:
      name: University of Amsterdam
  - name: Reza Samavi
    url: "https://www.ee.torontomu.ca/~samavi/"
    affiliations:
      name: Toronto Metropolitan University & Vector Institute
  - name: Efstratios Gavves
    url: "https://www.egavves.com/"
    affiliations:
      name: University of Amsterdam

bibliography: 2025-12-12-superposition.bib

toc:
  - name: Introduction
  - name: Related Work
    subsections:
      - name: Superposition and polysemanticity
      - name: Sparse autoencoders for feature extraction
      - name: Information theory and neural measurement
      - name: Quantifying feature entanglement
  - name: Background on Superposition and Sparse Autoencoders
    subsections:
      - name: Observing Superposition in Toy Models
      - name: Extracting Features Through Sparse Autoencoders
  - name: Measuring Superposition Through Information Theory
  - name: Validation of the Measurement Framework
    subsections:
      - name: Toy Model of Superposition
      - name: Dictionary Scaling Convergence
  - name: Applications and Findings
    subsections:
      - name: Dropout Reduces Features Through Redundant Encoding
      - name: Algorithmic Tasks Resist Superposition Despite Compression
      - name: Capturing Grokking Phase Transition
      - name: Layer-wise Organization in Language Models
  - name: Connection between Superposition and Adversarial Robustness
  - name: Limitations
  - name: Future Work
  - name: Conclusion
---

Neural networks achieve remarkable performance through <em>superposition</em>: encoding multiple features as overlapping directions in activation space rather than dedicating individual neurons to each feature. This phenomenon challenges interpretability; when neurons respond to multiple unrelated concepts, understanding network behavior becomes difficult. Yet despite its importance, we lack principled methods to measure superposition. We present an information-theoretic framework measuring a neural representation's <em>effective degrees of freedom</em>. We apply Shannon entropy to sparse autoencoder activations to compute the number of effective features as the minimum number of neurons needed for interference-free encoding. Equivalently, this measures how many "virtual neurons" the network simulates through superposition. When networks encode more effective features than they have actual neurons, they must accept interference as the price of compression. Our metric strongly correlates with ground truth in toy models, detects minimal superposition in algorithmic tasks (effective features approximately equal neurons), and reveals systematic reduction under dropout. Layer-wise patterns of effective features mirror studies of intrinsic dimensionality on Pythia-70M. The metric also captures developmental dynamics, detecting sharp feature consolidation during the grokking phase transition. Surprisingly, adversarial training can increase effective features while improving robustness, contradicting the hypothesis that superposition causes vulnerability. Instead, the effect of adversarial training on superposition depends on task complexity and network capacity: simple tasks with ample capacity allow feature expansion (abundance regime), while complex tasks or limited capacity force feature reduction (scarcity regime). By defining superposition as lossy compression, this work enables principled, practical measurement of how neural networks organize information under computational constraints, particularly connecting superposition to adversarial robustness.

## Introduction

Interpretability and adversarial robustness could be two sides of the same coin <d-cite key="rauker_transparent_2023"></d-cite>. Adversarially trained models learn more interpretable features <d-cite key="engstrom_adversarial_2019,ilyas_adversarial_2019"></d-cite>, develop representations that transfer better <d-cite key="salman_adversarially_2020"></d-cite>, and align more closely with human perception <d-cite key="santurkar_image_2019"></d-cite>. Conversely, interpretability-enhancing techniques improve robustness: input gradient regularization <d-cite key="ross_improving_2017,boopathy_proper_2020"></d-cite>, attribution smoothing <d-cite key="etmann_connection_2019"></d-cite>, and feature disentanglement <d-cite key="augustin_adversarial_2020"></d-cite> all defend against adversarial attacks. Even architectural choices that promote interpretability, such as lateral inhibition <d-cite key="eigen_topkconv_2021"></d-cite> and second-order optimization <d-cite key="tsiligkaridis_second_2020"></d-cite>, yield more robust models. This pervasive duality demands mechanistic explanation.

The superposition hypothesis offers a potential mechanism. Elhage *et al.* <d-cite key="elhage_toy_2022"></d-cite> showed that neural networks compress information through *superposition*: encoding multiple features as overlapping activation patterns. When features share dimensions, their interference creates attack surfaces that adversaries might exploit. If, by this mechanism, superposition caused adversarial vulnerability, this would explain *i.)* adversarial transferability as shared feature correlations <d-cite key="liu_delving_2017"></d-cite>, *ii.)* the robustness-accuracy trade-off as models sacrificing representational capacity for orthogonality <d-cite key="tsipras_robustness_2019"></d-cite>, and *iii.)* robust models becoming more interpretable by reducing feature entanglement <d-cite key="engstrom_adversarial_2019"></d-cite>. Also, this superposition-vulnerability hypothesis predicts that *adversarial training should reduce superposition*.

Testing this prediction requires measuring superposition in real networks. While Elhage *et al.* <d-cite key="elhage_toy_2022"></d-cite> used weight matrix Frobenius norms, this approach requires ground truth features; available only in toy models. We need principled methods to quantify superposition without knowing the true features.

We solve this through information theory applied to sparse autoencoders (SAEs). SAEs extract interpretable features from neural activations <d-cite key="cunningham_sparse_2024,bricken_monosemanticity_2023"></d-cite>, decomposing them into sparse dictionary elements. We measure each feature's share of the network's representational budget through its activation magnitude across samples.

The exponential of the Shannon entropy quantifies how many interference-free channels would transmit this feature distribution, the network's *effective degrees of freedom*. We call this count *effective features* $F$ (<a href="#fig:defining" class="figure-ref">Figure 2b</a>): the minimum neurons needed to encode the observed features without interference. We interpret this as $F$ "virtual neurons": the network simulates this many independent channels through its $N$ physical neurons (<a href="#fig:defining" class="figure-ref">Figure 2b</a>). The feature distribution compresses losslessly down to exactly $F$ neurons; compress further and interference becomes unavoidable.

We measure superposition as $\psi = F/N$ (<a href="#fig:defining" class="figure-ref">Figure 2c</a>), counting virtual neurons per physical neuron. At $\psi = 1$, the network operates at its interference-free limit (no superposition). At $\psi = 2$, it simulates twice as many channels as it has neurons, achieving 2× lossy compression. Thus, we define superposition as compression beyond the lossless limit.

<figure id="fig:defining">
<div class="row" style="align-items: center; --img-height: 124px;">
  <div class="col">
    <img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/neurons.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
  </div>
  <div class="col">
    <img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/features.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
  </div>
  <div class="col">
    <img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/definition.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
  </div>
</div>
  
  <figcaption style="color: var(--global-text-color);">
    <strong>Figure 1:</strong> Defining superposition for a neural network layer. 
    <strong>(a)</strong> Observed network with compressed representation where multiple features share neuronal dimensions. 
    <strong>(b)</strong> Hypothetical disentangled model where each effective feature occupies its own neuron without interference <d-cite key="elhage_toy_2022"></d-cite>. 
    <strong>(c)</strong> Superposition measure $\psi$ quantifies effective features per neuron. Here, the network simulates twice as many effective features as it has neurons. 
    Figure adapted from <d-cite key="bereska_mechanistic_2024"></d-cite>.
    (View PDFs: 
    <a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/neurons.pdf" target="_blank">(a)</a>
    <a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/features.pdf" target="_blank">(b)</a>
    <a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/definition.pdf" target="_blank">(c)</a>
    )
  </figcaption>
</figure>

Our findings contradict the simple superposition-vulnerability hypothesis. Adversarial training does not universally reduce superposition; its effect depends on task complexity relative to network capacity ([Section 7](#connection-between-superposition-and-adversarial-robustness)). Simple tasks with ample capacity permit *abundance*: networks expand features for robustness. Complex tasks under constraints force *scarcity*: networks compress further, reducing features. This bifurcation holds across architectures (MLPs, CNNs, ResNet-18) and datasets (MNIST, Fashion-MNIST, CIFAR-10).

We validate the framework where superposition is observable. Toy models achieve $r = 0.94$ correlation through the SAE extraction pipeline ([Section 5.1](#toy-model-of-superposition)), and under SAE dictionary scaling the measure converges with appropriate regularization ([Section 5.2](#dictionary-scaling-convergence)). Beyond adversarial training, systematic measurement across contexts generates hypotheses about neural organization: dropout seems to act as capacity constraint, reducing superposition ([Section 6.1](#dropout-reduces-features-through-redundant-encoding)), compressing networks trained on algorithmic tasks seems to not create superposition ($\psi \leq 1$) likely due to lack of input sparsity ([Section 6.2](#algorithmic-tasks-resist-superposition-despite-compression)), during grokking, we capture the moment of algorithmic discovery through sharp drop in superposition at the generalization transition ([Section 6.3](#capturing-grokking-phase-transition)), and Pythia-70M's layer-wise compression peaks in early MLPs before declining ([Section 6.4](#layer-wise-organization-in-language-models)); mirroring intrinsic dimensionality studies <d-cite key="ansuini_intrinsic_2019"></d-cite>.

This work makes superposition measurable. By grounding neural compression in information theory, we enable quantitative study of how networks encode information under capacity constraints, potentially enabling systematic engineering of interpretable architectures.

## Related Work

#### Superposition and polysemanticity

Neural networks employ distributed representations, encoding information across multiple units rather than in isolated neurons <d-cite key="hinton_distributed_1984,olah_distributed_2023"></d-cite>. The discovery that semantic relationships manifest as directions in embedding space, exemplified by vector arithmetic like "king - man + woman = queen" <d-cite key="mikolov_distributed_2013"></d-cite>, established the *linear representation hypothesis* <d-cite key="park_linear_2023"></d-cite>. Building on this geometric insight, Elhage *et al.* <d-cite key="elhage_toy_2022"></d-cite> formulated the *superposition hypothesis*: networks encode more features than dimensions by representing features as nearly orthogonal directions. Their toy models revealed phase transitions between monosemantic neurons (one feature per neuron) and polysemantic neurons (multiple features per neuron), governed by feature sparsity. Recent theoretical work proves networks can compute accurately despite the interference inherent in superposition <d-cite key="vaintrob_mathematical_2024,hanni_mathematical_2024"></d-cite>.

While superposition (more effective features than neurons) inevitably creates polysemantic neurons through feature interference, polysemanticity (multiple features sharing a neuron) also emerges by other means: rotation of features relative to the neuron basis, incidentally <d-cite key="lecomte_incidental_2023"></d-cite> (e.g. via regularization), or forced by noise (such as dropout) as redundant encoding <d-cite key="marshall_understanding_2024"></d-cite> (as we show in [Section 5.1](#dropout-reduces-features-through-redundant-encoding), dropout shows the *opposite* effect on superposition). Scherlis *et al.* <d-cite key="scherlis_polysemanticity_2023"></d-cite> analyzed how features compete for limited neuronal capacity, showing that importance-weighted feature allocation can explain which features become polysemantic under resource constraints.

#### Sparse autoencoders for feature extraction

Sparse autoencoders (SAEs) tackle the challenge of extracting interpretable features from polysemantic representations by recasting it as sparse dictionary learning <d-cite key="sharkey_taking_2022,cunningham_sparse_2024"></d-cite>. SAEs decompose neural activations into sparse combinations of learned dictionary elements, effectively reversing the superposition process. Recent architectural innovations such as gated SAEs <d-cite key="rajamanoharan_improving_2024"></d-cite>, TopK variants <d-cite key="gao_scaling_2024,bussmann_batchtopk_2024"></d-cite>, and Matryoshka SAEs <d-cite key="bussmann_learning_2025"></d-cite> improve feature recovery. While our experiments employ vanilla SAEs for conceptual clarity, our entropy-based framework remains architecture-agnostic: improved feature extraction yields more accurate measurements without invalidating the theoretical foundation.

SAEs scale to state-of-the-art models: Anthropic extracted millions of interpretable features from Claude 3 Sonnet <d-cite key="templeton_scaling_2024"></d-cite>, while OpenAI achieved similar results with GPT-4 <d-cite key="gao_scaling_2024"></d-cite>. Crucially, these features are causally relevant: activation steering produces predictable behavioral changes <d-cite key="marks_sparse_2024"></d-cite>. Applications span attention mechanism analysis <d-cite key="kissane_interpreting_2024"></d-cite>, reward model interpretation <d-cite key="marks_interpreting_2023"></d-cite>, and automated feature labeling <d-cite key="paulo_automatically_2024"></d-cite>, establishing SAEs as foundational for mechanistic interpretability <d-cite key="bereska_mechanistic_2024"></d-cite>.

#### Information theory and neural measurement

Information-theoretic principles provide rigorous foundations for understanding neural representations. The information bottleneck principle <d-cite key="tishby_information_2000"></d-cite>, when applied to deep learning <d-cite key="shwartz-ziv_opening_2017"></d-cite>, reveals how networks balance compression with prediction. Each neural layer acts as a bandwidth-limited channel, forcing networks to develop efficient codes (i.e. superposition) to transmit information forward <d-cite key="goldfeld_estimating_2019"></d-cite>. This perspective recasts superposition as an optimal solution to rate-distortion constraints.

Most pertinent to our work, Ayonrinde *et al.* <d-cite key="ayonrinde_interpretability_2024"></d-cite> connected SAEs to minimum description length (MDL). By viewing SAE features as compression codes for neural activations, they showed that optimal SAEs balance reconstruction fidelity against description complexity. Our entropy-based framework extends this perspective, measuring the effective "alphabet size" networks use for internal communication.

#### Quantifying feature entanglement

Despite its theoretical importance, measuring superposition remains unexplored. Elhage *et al.* <d-cite key="elhage_toy_2022"></d-cite> proposed a dimensions per feature metric for analyzing uniform importance settings in toy models, which when inverted could measure features per dimension. But this approach requires knowing the ground truth feature-to-neuron mapping matrix, limiting its applicability to controlled settings. Traditional disentanglement metrics from representation learning <d-cite key="carbonneau_measuring_2022,eastwood_framework_2018"></d-cite> assess statistical independence rather than the representational compression characterizing superposition. Other dimensionality measures like effective rank <d-cite key="roy_effective_2007"></d-cite> and participation ratio <d-cite key="gao_theory_2017"></d-cite> quantify the number of significant dimensions in a representation but do not directly measure feature-to-neuron compression ratios.

Entropy-based measures have proven effective across disciplines facing similar measurement challenges. Neuroscience employs participation ratios (form of entropy, see [Appendix](#hill-numbers) for connection to Hill numbers) to quantify how many neurons contribute to population dynamics <d-cite key="gao_theory_2017"></d-cite>. Economics uses entropy to quantify portfolio concentration <d-cite key="fontanari_portfolio_2019"></d-cite>. Quantum physics applies von Neumann entropy to count effective pure states in entangled systems <d-cite key="nielsen_quantum_2011"></d-cite>. Recent work applies entropy measures to neural network analysis <d-cite key="lee_estimating_2023,shin_disentangling_2024"></d-cite>. Across fields, entropy naturally captures how information distributes across components: exactly what we need for measuring superposition.

## Background on Superposition and Sparse Autoencoders

Neural networks must transmit information through layers with fixed dimensions. When neurons must encode information about many more features than available dimensions, networks employ *superposition*: packing multiple features into shared dimensions through interference. This compression mechanism enables representing more features than available neurons at the cost of introducing crosstalk between them. Superposition is compression beyond the lossless limit.

We examine toy models where superposition emerges under controlled bandwidth constraints, making interference patterns directly observable ([Section 3.1](#observing-superposition-in-toy-models)). For real networks where ground truth remains unknown, we extract features through sparse autoencoders before measurement becomes possible ([Section 3.2](#extracting-features-through-sparse-autoencoders)).

<figure id="fig:superposition_framework">
<div class="row" style="align-items: center; --img-height: 110px;">
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/toy_model.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/sparsity.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/sae.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/counting.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
</div>

<figcaption style="color: var(--global-text-color);">
<strong>Figure 2:</strong> From toy model to practical superposition measurement. 
<strong>(a)</strong> Toy model bottlenecks features $\mathbf{f}$ through fewer neurons $\mathbf{x}$, with importance gradient determining allocation. 
<strong>(b)</strong> Sparsity enables interference-based compression: matrices $\mathbf{W}_{\text{toy}}^T \mathbf{W}_{\text{toy}}$ show off-diagonal terms growing as $\psi$ increases from 1 to 2.5. 
<strong>(c)</strong> Sparse autoencoders learn sparse codes $\mathbf{z}$ reconstructing activations $\mathbf{x}$. 
<strong>(d)</strong> Measurement: extract activations $\mathbf{Z}$, derive probabilities $p$, compute $F = e^{H(p)}$, measure $\psi = F/N$.
(View PDFs: 
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/toy_model.pdf" target="_blank">(a)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/sparsity.pdf" target="_blank">(b)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/sae.pdf" target="_blank">(c)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/counting.pdf" target="_blank">(d)</a>
)
</figcaption>
</figure>

### Observing Superposition in Toy Models

To understand how neural networks represent more features than they have dimensions, Elhage *et al.* <d-cite key="elhage_toy_2022"></d-cite> introduced minimal models demonstrating superposition under controlled conditions. The toy model compresses a feature vector $\mathbf{f} \in \mathbb{R}^M$ through a bottleneck $\mathbf{x} \in \mathbb{R}^N$ where $M > N$:

<div>
<p></p>
<div class="math-block" style="text-align: center;">
$\mathbf{x} = \mathbf{W}_{\text{toy}}\mathbf{f}, \quad \mathbf{f'} = \text{ReLU}(\mathbf{W}_{\text{toy}}^T\mathbf{x} + \mathbf{b})$
</div>
<p></p>
</div>

Here $M$ counts input features, $N$ counts bottleneck neurons, and $\mathbf{W}\_{\text{toy}} \in \mathbb{R}^{N \times M}$ maps between them. The model must represent $M$ features using only $N$ dimensions; impossible unless features share neuronal resources.

Each input feature $f_i$ samples uniformly from $[0,1]$ with sparsity $S$ (probability of being zero) and importance weight $\omega_i$. Training minimizes importance-weighted reconstruction error $\mathcal{L}(\mathbf{f}) = \sum_{i=1}^M \omega_i\|f_i - f'_i\|^2$, revealing how networks optimally allocate limited bandwidth.

As sparsity increases, the model packs features into shared dimensions through nearly-orthogonal arrangements (<a href="#fig:superposition_framework" class="figure-ref">Figure 2b</a>). The interference matrix $\mathbf{W}\_{\text{toy}}^T \mathbf{W}\_{\text{toy}}$ reveals this geometric solution: at low compression, strong diagonal with minimal off-diagonal terms; at high compression, substantial off-diagonal interference as features share space. These interference terms quantify the distortion networks accept for increased capacity. The ReLU nonlinearity proves essential, suppressing small interference to maintain reconstruction despite feature overlap.

Elhage *et al.* <d-cite key="elhage_toy_2022"></d-cite> proposed measuring "dimensions per feature" as $D^* = N/\lVert \mathbf{W}\_{\text{toy}}\rVert_{\text{Frob}}^2$ for analyzing uniform importance settings, where the Frobenius norm $\lVert \mathbf{W}\_{\text{toy}}\rVert_{\text{Frob}}^2 = \sum_{i,j} W_{ij}^2$ aggregates weight magnitudes. While this metric was not intended for general superposition measurement, we adopt its inverse as a baseline, as it provides the only existing weight-based comparison point for toy model validation:

<div id="eq:frobenius">
<p></p>
<div class="math-block" style="text-align: center;">
$\psi_{\text{Frob}} = \frac{\lVert \mathbf{W}_{\text{toy}}\rVert_{\text{Frob}}^2}{N}$ <span style="float: right;">(1)</span>
</div>
<p></p>
</div>

This weight-based approach requires knowing the true feature-to-neuron mapping (unavailable in real networks) and lacks scale invariance; multiplying weights by any constant arbitrarily changes the measure. We need a principled framework quantifying compression *without* ground truth features.

### Extracting Features Through Sparse Autoencoders

Real networks do not reveal their features directly. Instead, we must untangle them from distributed neural activations. Sparse autoencoders (SAEs) decompose activations into sparse combinations of learned dictionary elements, effectively reverse-engineering the toy model's feature representation <d-cite key="cunningham_sparse_2024,bricken_monosemanticity_2023"></d-cite>.

Given layer activations $\mathbf{x} \in \mathbb{R}^N$, an SAE learns a higher-dimensional sparse code $\mathbf{z} \in \mathbb{R}^D$ where $D > N$ (<a href="#fig:superposition_framework" class="figure-ref">Figure 2c</a>):

<div>
<p></p>
<div class="math-block" style="text-align: center;">
$\mathbf{z} = \text{ReLU}(\mathbf{W}_{\text{enc}}\mathbf{x} + \mathbf{b})$
</div>
<p></p>
</div>

The reconstruction combines these sparse features:

<div>
<p></p>
<div class="math-block" style="text-align: center;">
$\mathbf{x'} = \mathbf{W}_{\text{dec}}\mathbf{z} = \sum_{i=1}^D z_i \mathbf{d}_i$
</div>
<p></p>
</div>

where columns $\mathbf{d}_i$ of $\mathbf{W}\_{\text{dec}}$ form the learned dictionary.

Training balances faithful reconstruction against sparse activation:

<div>
<p></p>
<div class="math-block" style="text-align: center;">
$\mathcal{L}(\mathbf{x}, \mathbf{z}) = \lVert \mathbf{x} - \mathbf{x'}\rVert_2^2 + \lambda \lVert \mathbf{z}\rVert_1$
</div>
<p></p>
</div>

The $\ell_1$ penalty creates explicit competition: the bound on total activation $\sum_i \lvert z_i\rvert$ forces features to justify their magnitude by contributing to reconstruction. This implements resource allocation where larger $\lvert z_i\rvert$ indicates greater consumption of the network's limited representational budget (see [Appendix](#l1-norm-budget) for rate-distortion derivation).

**SAE design choices.** We tie encoder and decoder weights ($\mathbf{W}\_{\text{dec}} = \mathbf{W}\_{\text{enc}}^T$) to enforce features as directions in activation space, maintaining conceptual clarity at potential cost to reconstruction <d-cite key="bricken_monosemanticity_2023"></d-cite>. Weight tying also prevents feature absorption artifacts <d-cite key="chanind_toy_2024"></d-cite>. We omit decoder bias following Cunningham *et al.* <d-cite key="cunningham_sparse_2024"></d-cite> for a transparent baseline, accepting slight performance degradation. The $\ell_1$ regularization provides clean budget semantics, though alternatives like TopK <d-cite key="gao_scaling_2024"></d-cite> could work within our framework.

If networks truly employ superposition, SAEs should recover the underlying features enabling measurement. Recent work shows SAE features causally affect network behavior <d-cite key="marks_sparse_2024"></d-cite>, suggesting they capture genuine computational structure. Our measurement framework remains architecture-agnostic: improved SAE variants enhance accuracy without invalidating the theoretical foundation.

## Measuring Superposition Through Information Theory

We quantify superposition by determining how many neurons would be required to transmit the observed feature distribution without interference. Information theory provides a precise answer: Shannon's source coding theorem establishes that any distribution with entropy $H(p)$ can be losslessly compressed to $e^{H(p)}$ uniformly-allocated channels. This represents the minimum bandwidth for interference-free transmission; the network's *effective degrees of freedom*.

We formalize superposition as the compression ratio $\psi = F/N$, where $N$ counts physical neurons and $F = e^{H(p)}$ measures effective degrees of freedom extracted from SAE activation statistics[^1] (<a href="#fig:superposition_framework" class="figure-ref">Figure 2d</a>). When $\psi = 1$, the network operates at the lossless boundary. When $\psi > 1$, features necessarily share dimensions through interference. For instance, in <a href="#fig:superposition_framework" class="figure-ref">Figure 2b</a>, 5 features represented in 2 neurons yields $\psi = 2.5$.

**Feature probabilities from resource allocation.** Consider a layer with $N$ neurons whose activations have been processed by an SAE with dictionary size $D$. Across $S$ samples, the SAE produces sparse codes $\mathbf{Z} = \text{ReLU}(\mathbf{W}\_{\text{sae}}\mathbf{X}) \in \mathbb{R}^{D \times S}$ where $\mathbf{X} \in \mathbb{R}^{N \times S}$ contains the original activations. Each feature's probability reflects its share of total activation magnitude[^2]:

<div>
<p></p>
<div class="math-block" style="text-align: center;">
$p_i = \frac{\sum_{s=1}^S \lvert z_{i,s}\rvert}{\sum_{j=1}^D \sum_{s=1}^S \lvert z_{j,s}\rvert} = \frac{\text{budget allocated to feature } i}{\text{total representational budget}}$
</div>
<p></p>
</div>

The SAE's $\ell_1$ regularization ensures these allocations reflect computational importance. Features activating more frequently or strongly consume more capacity, with optimal $\lvert z_i\rvert$ proportional to marginal contribution to reconstruction quality (derivation in [Appendix](#l1-norm-budget)).

**Effective features as lossless compression limit.** Shannon entropy quantifies the information content of this distribution:

<div>
<p></p>
<div class="math-block" style="text-align: center;">
$H(p) = -\sum_i p_i \log p_i$
</div>
<p></p>
</div>

Its exponential measures effective degrees of freedom, the minimum neurons needed to encode $p$ without interference:

<div>
<p></p>
<div class="math-block" style="text-align: center;">
$F = e^{H(p)}$
</div>
<p></p>
</div>

This is the network's lossless compression limit: the feature distribution could be transmitted through $F$ neurons with no information loss. Using fewer than $F$ neurons guarantees interference as features must share dimensions; using exactly $F$ achieves the interference-free boundary. The actual layer width $N$ determines whether compression remains lossless ($N \geq F$) or becomes lossy ($N < F$). The ratio then measures superposition as lossy compression:

<div>
<p></p>
<div class="math-block" style="text-align: center;">
$\psi = \frac{F}{N}$
</div>
<p></p>
</div>

While the SAE extracts $D$ *interpretable features*, semantic concepts humans might recognize, our measure quantifies $F$ *effective features*, the interference-free channel capacity required for their activation distribution. A network might use $D=1000$ interpretable features but need only $F=50$ effective features if most activate rarely.

Our measure inherits desirable properties from entropy. First, for any $D$-component distribution, the output stays bounded: $1 \leq F(p) \leq D$, constrained by single-feature dominance and uniform distribution. Second, unlike threshold-based counting, features contribute according to their information content: rare features matter less than common ones; weak features less than strong ones. This enables the interpretation as effective degrees of freedom, beyond merely "counting features."

In practice, we use sufficient samples until convergence (see convergence analysis in [Section 6.4](#layer-wise-organization-in-language-models)). For convolutional layers, we treat spatial positions as independent samples, measuring superposition across the channel dimension (see [Appendix](#convolutional-networks)). While the data distribution for extracting SAE activations should generally reflect the training distribution, for studying adversarial training's effect, we evaluate on both clean inputs and adversarially perturbed inputs for contrast.

This framework enables quantifying superposition without ground truth by measuring each layer's compression ratio; how many virtual neurons it simulates relative to its physical dimension.

## Validation of the Measurement Framework

### Toy Model of Superposition

<figure id="fig:metric_validation">
<div class="row" style="align-items: center; --img-height: 115px;">
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/correlations.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/hyperparameters.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
</div>

<figcaption style="color: var(--global-text-color);">
<strong>Figure 3:</strong> Validation of superposition metrics. 
<strong>(a)</strong> Our measure maintains high correlation whether applied to toy weights ($r=0.99$) or SAE activations ($r=0.94$), while the Frobenius norm fails on SAE weights. 
<strong>(b)</strong> Performance remains stable across $\ell_1$ regularization, model scale, and dictionary size variations. Shaded regions show 95% confidence intervals across 100 model-SAE pairs.
(View PDFs: 
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/correlations.pdf" target="_blank">(a)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/hyperparameters.pdf" target="_blank">(b)</a>
)
</figcaption>
</figure>

We validate our measure using the toy model of superposition <d-cite key="elhage_toy_2022"></d-cite>, where interference patterns are directly observable. This controlled setting tests whether sparse autoencoders can recover accurate feature counts from superposed representations.

Following Elhage *et al.* <d-cite key="elhage_toy_2022"></d-cite>, we generate 100 toy models with sparsity $S \in [0.001, 0.999]$. Each model compresses 20 features through a 5-neuron bottleneck, with importance weights decaying as $\omega_i = 0.7^i$. After training to convergence, we extract 10,000 activation samples and train SAEs with 40-dimensional dictionaries (8× expansion) and $\ell_1$ coefficient 0.1. This two-stage process mimics real-world measurement where ground truth remains unknown.

**Validation strategy.** Our validation proceeds in two steps. First, we establish reference values by measuring superposition directly from $\mathbf{W}\_{\text{toy}}$, where the interference matrix $\mathbf{W}\_{\text{toy}}^T \mathbf{W}\_{\text{toy}}$ reveals compression levels: diagonal dominance indicates orthogonal features; off-diagonal terms show interference (<a href="#fig:superposition_framework" class="figure-ref">Figure 2b</a>). Both our entropy-based measure and the Frobenius norm baseline (<a href="#eq:frobenius">Equation 1</a>) achieve near-perfect correlation ($r = 0.99 \pm 0.01$) when applied to toy model weights, confirming both track these observable patterns (<a href="#fig:metric_validation" class="figure-ref">Figure 3a</a>).

Second, we test whether each metric recovers these reference values when given only SAE outputs, the realistic scenario for measuring real networks. Here the Frobenius norm fails catastrophically on SAE weights, producing nonlinear relationships and incorrect scales (0.1–0.7 versus expected 1–4); the $\ell_1$ regularization fundamentally alters weight statistics. Our activation-based approach maintains strong correlation ($r = 0.94 \pm 0.02$) with the reference values even through the SAE bottleneck.

**Hyperparameter stability.** We test sensitivity across three axes: $\ell_1$ strength ($10^{-3}$ to $10^1$), model scale (8–32 input dimensions), and dictionary expansion (2× to 32×). <a href="#fig:metric_validation" class="figure-ref">Figure 3b</a> shows stable performance across most configurations. Correlation degrades when extreme regularization ($\ell_1 = 10$) suppresses features, when dictionaries lack capacity to represent the feature set, when toy models are too small or too large to train reliably, or when very large dictionaries enable feature splitting (see [Section 5.2](#dictionary-scaling-convergence)). These failure modes reflect limitations of the toy model or SAE training rather than the measure itself.

### Dictionary Scaling Convergence

<figure id="fig:multitasksparsity">
<div class="row" style="align-items: center; --img-height: 135px;">
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/dict_scaling.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/dropout_results.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/dropout.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
</div>

<figcaption style="color: var(--global-text-color);">
<strong>Figure 4:</strong> Measurements on multi-task sparse parity dataset. 
<strong>(a)</strong> Dictionary scaling plateaus with proper regularization ($\ell_1 \geq 0.1$), validating intrinsic structure measurement. Weak regularization ($\ell_1 = 0.01$) shows unbounded growth through arbitrary subdivision. 
<strong>(b)</strong> Dropout monotonically reduces effective features and accuracy. 
<strong>(c)</strong> Capacity-dependent response: larger networks show reduced sensitivity while narrow networks exhibit sharp feature reduction, distinguishing polysemanticity (neurons encoding multiple features) from superposition (compression beyond lossless limit).
(View PDFs: 
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/dict_scaling.pdf" target="_blank">(a)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/dropout_results.pdf" target="_blank">(b)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/dropout.pdf" target="_blank">(c)</a>
)
</figcaption>
</figure>

Measuring a natural coastline with a finer ruler yields a longer measurement; potentially without bound <d-cite key="mandelbrot_how_1967"></d-cite>. As SAE dictionaries grow, might we discover arbitrarily many features at finer scales?

We test convergence using multi-task sparse parity <d-cite key="michaud_quantization_2023"></d-cite> (3 tasks, 4 bits each) where ground truth bounds meaningful features. Networks with 64 hidden neurons trained across dictionary scales (0.5× to 16× hidden dimension) and $\ell_1$ strengths (0.01 to 10.0).

<a href="#fig:multitasksparsity" class="figure-ref">Figure 4a</a> reveals two regimes. With appropriate regularization ($\ell_1 \geq 0.1$), feature counts plateau despite dictionary expansion, indicating we measure the network's representational structure and not arbitrary decomposition; i.e. feature splitting <d-cite key="chanin_absorption_2024"></d-cite>. Weak regularization ($\ell_1 = 0.01$) permits continued growth across all tested scales. This reflects feature splitting rather than genuine superposition, where the SAE decomposes single computational features into spurious fine-grained components. Excessive regularization ($\ell_1 = 10.0$) suppresses features entirely.

The dependence on dictionary size means absolute counts vary with SAE architecture, but comparative measurements remain valid: networks analyzed under identical configurations yield meaningful relative differences, even as changing those configurations shifts all measurements systematically.

## Applications and Findings

We measure superposition across four neural compression phenomena: capacity constraint under dropout ([Section 6.1](#dropout-reduces-features-through-redundant-encoding)), algorithmic tasks that resist superposition despite compression ([Section 6.2](#algorithmic-tasks-resist-superposition-despite-compression)), developmental dynamics during learning transitions ([Section 6.3](#capturing-grokking-phase-transition)), and layer-wise representational organization in language models ([Section 6.4](#layer-wise-organization-in-language-models)).

Each finding here is a preliminary, exploratory analysis on specific architectures and tasks. Our primary contribution remains the measurement tool itself. These findings illustrate its potential utility while generating testable hypotheses for future systematic investigation across broader experimental conditions.

### Dropout Reduces Features Through Redundant Encoding

We investigate how dropout affects feature organization using multi-task sparse parity (3 tasks, 4 bits each) with simple MLPs across hidden dimensions $h \in \{16, 32, 64, 128\}$ and dropout rates [0.0, 0.1, ..., 0.9].

Marshall *et al.* <d-cite key="marshall_understanding_2024"></d-cite> showed dropout induces polysemanticity through redundancy: features must distribute across neurons to survive random deactivation. One might expect this redundancy to increase measured superposition. Instead, dropout monotonically reduces effective features by up to 50% (<a href="#fig:multitasksparsity" class="figure-ref">Figure 4b</a>).

We propose this reflects the *distinction between polysemanticity and superposition* (<a href="#fig:multitasksparsity" class="figure-ref">Figure 4c</a>). If dropout forces each feature to occupy multiple neurons for robustness, this redundant encoding would consume capacity, leaving room for fewer total features within the same dimensional budget. Under this interpretation, networks respond by pruning less essential features, consistent with Scherlis *et al.*'s <d-cite key="scherlis_polysemanticity_2023"></d-cite> competitive resource allocation framework.

The capacity dependence supports this account: larger networks show reduced dropout sensitivity while narrow networks exhibit sharp feature reduction, suggesting capacity constraints mediate the effect.

### Algorithmic Tasks Resist Superposition Despite Compression

<figure id="fig:tracr">
<div class="row" style="align-items: center; --img-height: 130px;">
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/compress.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/reverse.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/sort.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
</div>

<figcaption style="color: var(--global-text-color);">
<strong>Figure 5:</strong> Algorithmic tasks under compression. 
<strong>(a)</strong> Compression architecture projects activations through $\text{ReLU}(\mathbf{W}^\top \mathbf{W}\mathbf{x})$ to force features into fewer dimensions. 
<strong>(b)</strong> Sequence reversal: progressive compression from native 45D increases superposition from $\psi \approx 0.3$ toward $\psi = 1$ (leftmost to rightmost points approaching $F=N$ line). Once reaching the $F=N$ boundary, further compression causes performance degradation and then collapse (× markers) rather than superposition beyond $\psi = 1$. 
<strong>(c)</strong> Sorting exhibits identical dynamics with $F \approx N$ throughout compression. Both tasks resist genuine superposition ($\psi > 1$), operating at the lossless limit where each neuron encodes one effective feature, likely due to lack of input sparsity for sequence operations.
(View PDFs: 
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/compress.pdf" target="_blank">(a)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/reverse.pdf" target="_blank">(b)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/sort.pdf" target="_blank">(c)</a>
)
</figcaption>
</figure>

Tracr compiles human-readable programs into transformer weights with known computational structure <d-cite key="lindner_tracr_2023"></d-cite>. We examine sequence reversal ("123" → "321") and sorting ("213" → "123"), comparing compiled models at their original dimensionality (compression factor 1×) against compressed variants and transformers trained from scratch with matching architectures.

Following Lindner *et al.* <d-cite key="lindner_tracr_2023"></d-cite>, we compress models by projecting residual stream activations through learned compression matrices. Our compression scheme (<a href="#fig:tracr" class="figure-ref">Figure 5a</a>) applies $\text{ReLU}(\mathbf{W}^\top \mathbf{W}\mathbf{x})$ where $\mathbf{W} \in \mathbb{R}^{N \times M}$, compressing from originally $M$ dimensions to $N$. The ReLU activation, absent in the original Tracr compression, allows small interference terms to cancel out following the toy model rationale <d-cite key="elhage_toy_2022"></d-cite>.

The compression dynamics reveal limits on superposition in these algorithmic tasks (<a href="#fig:tracr" class="figure-ref">Figure 5b, 5c</a>). Both compiled Tracr models and transformers trained from scratch converge to ~12 features for reversal and ~10 for sorting[^3]—far below their original compiled dimensions (45D for reversal), revealing substantial dimensional redundancy in Tracr's compilation.

As compression reduces dimensions from 45D toward the task-intrinsic boundary, superposition increases from $\psi \approx 0.3$ toward $\psi = 1$. However, compression stops increasing superposition once models reach the $F=N$ diagonal: further dimensional reduction causes linear drop in effective features and eventually performance collapse (× markers) rather than superposition beyond $\psi = 1$, resisting genuine superposition ($\psi > 1$) entirely.

This resistance likely stems from algorithmic tasks violating the sparsity assumption required for lossy compression <d-cite key="elhage_toy_2022"></d-cite>. The toy model of superposition requires features to activate sparsely across inputs: most features remain inactive on most samples, keeping interference manageable. Algorithmic tasks break this assumption; sequence operations require consistent activation patterns across inputs. Without sparsity, interference becomes destructive rather than enabling compression. While we originally anticipated this setting would enable controlled validation across superposition levels, the systematic $F \approx N$ tracking, coupled with performance collapse when dimensions drop below this boundary, instead provides indirect evidence that our measure captures genuine capacity constraints, detecting minimal superposition as the sparsity prerequisite fails.

### Capturing Grokking Phase Transition

<figure id="fig:application">
<div class="row" style="align-items: center; --img-height: 126px;">
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/pythia.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/grokking.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
</div>

<figcaption style="color: var(--global-text-color);">
<strong>Figure 6:</strong> 
<strong>(a)</strong> Non-monotonic feature organization across Pythia-70M. MLP layer 1 peaks at ~10,000 features (20× neurons). Convergence analysis shows saturation after $2 \times 10^4$ samples. 
<strong>(b)</strong> Feature dynamics during grokking on modular arithmetic. Sharp consolidation at generalization transition (epoch 60) follows smoother LLC decay. Strong correlation ($r = 0.908$, $p < 0.001$) with LLC suggests feature count functions as a measure of model complexity.
(View PDFs: 
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/pythia.pdf" target="_blank">(a)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/grokking.pdf" target="_blank">(b)</a>
)
</figcaption>
</figure>

Grokking (sudden perfect generalization after extended training on algorithmic tasks) provides an ideal testbed for developmental measurement <d-cite key="power_grokking_2022"></d-cite>. We investigate whether feature count dynamics can detect this phase transition and how they relate to the Local Learning Coefficient (LLC) from singular learning theory <d-cite key="hoogland_developmental_2024"></d-cite>.

We train a two-path MLP on modular arithmetic $(a + b) \bmod 53$. <a href="#fig:application" class="figure-ref">Figure 6b</a> reveals distinct dynamics: while LLC shows initial proliferation followed by smooth decay throughout training, our feature count exhibits sharp consolidation precisely at the generalization transition.

This pattern suggests the measures capture different aspects of complexity evolution. During memorization, the model employs numerous superposed features to store input-output mappings. The sharp consolidation coincides with algorithmic discovery, where the model reorganizes from distributed lookup tables into compact representations that capture the modular arithmetic rule <d-cite key="nanda_progress_2023"></d-cite>. Strong correlation ($r = 0.908$, $p < 0.001$) between feature count and LLC positions superposition measurement as a developmental tool for detecting emergent capabilities through their information-theoretic signatures.

### Layer-wise Organization in Language Models

We analyze Pythia-70M using pretrained SAEs from Marks *et al.* <d-cite key="marks_sparse_2024"></d-cite>, measuring feature counts across all layers and components. Convergence analysis (<a href="#fig:application" class="figure-ref">Figure 6a</a>) shows saturation after $2 \times 10^4$ samples. Feature importance follows power-law distributions: while 21,000 SAE features activate for MLP 1, our entropy-based measure yields 5,600 effective features, automatically downweighting rare activations.

MLPs store the most features, followed by residual streams, with attention maintaining minimal counts, consistent with MLPs as knowledge stores and attention as routing <d-cite key="geva_transformer_2021"></d-cite>. Features grow in early layers (MLP 1 achieves 20× compression), compress through middle layers, then re-expand before final consolidation.

This non-monotonic trajectory parallels intrinsic dimensionality studies <d-cite key="ansuini_intrinsic_2019"></d-cite>: both reveal "hunchback" patterns peaking in early-middle layers. Intrinsic dimensionality measures geometric manifold complexity (minimal dimensions describing activation structure), while we count effective information channels (minimal dimensions for lossless encoding), both measuring aspects of representational complexity.

## Connection between Superposition and Adversarial Robustness

<figure id="fig:task_complexity_effects">
<div class="row" style="align-items: center; --img-height: 175px;">
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/complexity_cnn.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/complexity_mlp.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
</div>

<figcaption style="color: var(--global-text-color);">
<strong>Figure 7:</strong> Higher task complexity shifts adversarial training's effect from feature expansion toward reduction. Each panel shows results varying dataset (MNIST top, Fashion-MNIST bottom) and number of classes (2, 3, 10). 
<strong>(a)</strong> CNNs show clear complexity-dependent transitions: simple tasks enable feature expansion while complex tasks (10 classes) force reduction below baseline. 
<strong>(b)</strong> MLPs exhibit similar patterns with more pronounced layer-wise variation. Fashion-MNIST consistently amplifies the reduction effect compared to MNIST, suggesting that representational demands drive defensive strategies beyond mere class count. Dashed lines: clean data; solid lines: adversarial examples. Feature count ratios normalized to $\epsilon = 0$ baseline. Error bars show standard error across 3 seeds.
(View PDFs: 
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/complexity_cnn.pdf" target="_blank">(a)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/complexity_mlp.pdf" target="_blank">(b)</a>
)
</figcaption>
</figure>

**Testing the superposition-vulnerability hypothesis.** The superposition-vulnerability hypothesis proposed by Elhage *et al.* <d-cite key="elhage_toy_2022"></d-cite> predicts that adversarial training should universally reduce superposition, as networks trade representational efficiency for orthogonal, robust features. We test this prediction systematically across diverse architectures and conditions, finding that the *direction* of the effect—expansion versus reduction—depends on task complexity and network capacity.

We employ PGD adversarial training <d-cite key="madry_deep_2018"></d-cite> across architectures ranging from single-layer to deep networks (MLPs, CNNs, ResNet-18) on multiple datasets (MNIST, Fashion-MNIST, CIFAR-10). Task complexity varies through both classification granularity (2, 3, 5, 10 classes) and dataset difficulty. Network capacity varies through hidden dimensions (8–512 for MLPs), filter counts (8–64 for CNNs), and width scaling (1/4× to 2× for ResNet-18). For convolutional networks, we measure superposition across channels by reshaping activation tensors to treat spatial positions as independent samples (see [Appendix](#convolutional-networks) for details). All SAEs use 4× dictionary expansion with $\ell_1 = 0.1$. Measurements on adversarial examples match the training distribution; models trained with $\epsilon = 0.2$ are evaluated on $\epsilon = 0.2$ attacks.

**Statistical methodology.** To quantify adversarial training effects, we extract normalized slopes representing how feature counts change per unit increase in adversarial training strength ($\epsilon \in \{0.0, 0.1, 0.2, 0.3\}$). Positive slopes indicate adversarial training *increases* features; negative slopes indicate *reduction*. For each experimental condition, we fit linear regressions to feature counts across epsilon values, pooling clean and adversarial observations to increase statistical power. These slopes are normalized by baseline ($\epsilon = 0$) feature counts, making effects comparable across layers with different absolute scales.

Since networks contain multiple layers, we aggregate layer-wise measurements using parameter-weighted averaging, where layers with more parameters receive proportionally higher weight. This reflects the assumption that computationally intensive layers better represent overall network behavior. For simple architectures, parameter counts include all weights and biases; for ResNet-18, we implement detailed counting that accounts for convolutions, batch normalization, and skip connections.

<div class="custom-box" style="--box-bg-color: #F9FDFE; --box-border-color: #8DA5AF; --box-text-color: #000000;">
  <h4 class="custom-title">Testing Adversarial Training Effects on Superposition</h4>
  <div class="custom-content">
    We test three formal hypotheses:
    <ul>
      <li><strong>H1 (Universal Reduction):</strong> Adversarial training uniformly reduces superposition across all conditions, directly testing Elhage <em>et al.</em>'s original prediction.</li>
      <li><strong>H2 (Complexity ↓):</strong> Higher task complexity shifts adversarial training's effect from feature expansion toward reduction. We encode complexity ordinally (2-class=1, 3-class=2, 5-class=3, 10-class=4) and test for negative linear trends in the adversarial training slope.</li>
      <li><strong>H3 (Capacity ↑):</strong> Higher network capacity shifts adversarial training's effect from feature reduction toward expansion. We test for positive log-linear relationships between capacity measures and adversarial training slopes.</li>
    </ul>
  </div>
</div>

<!-- <div style="background-color: #F9FDFE; border-left: 4px solid #8DA5AF; padding: 1.5em; margin: 1.5em 0;"> -->
<!-- <h4 style="margin-top: 0; color: #8DA5AF;">Testing Adversarial Training Effects on Superposition</h4> -->
<!-- <p>We test three formal hypotheses:</p> -->
<!-- <ul style="margin-bottom: 0;"> -->
<!-- <li><strong>H1 (Universal Reduction):</strong> Adversarial training uniformly reduces superposition across all conditions, directly testing Elhage <em>et al.</em>'s original prediction.</li> -->
<!-- <li><strong>H2 (Complexity ↓):</strong> Higher task complexity shifts adversarial training's effect from feature expansion toward reduction. We encode complexity ordinally (2-class=1, 3-class=2, 5-class=3, 10-class=4) and test for negative linear trends in the adversarial training slope.</li> -->
<!-- <li><strong>H3 (Capacity ↑):</strong> Higher network capacity shifts adversarial training's effect from feature reduction toward expansion. We test for positive log-linear relationships between capacity measures and adversarial training slopes.</li> -->
<!-- </ul> -->
<!-- </div> -->

All statistical tests use inverse-variance weighting to account for measurement uncertainty, with random-effects meta-analysis when significant heterogeneity exists across conditions.

<figure id="fig:capacity_effects">
<div class="row" style="align-items: center; --img-height: 142px;">
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/capacity_simple.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/capacity_complex.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
</div>

<figcaption style="color: var(--global-text-color);">
<strong>Figure 8:</strong> Higher network capacity shifts adversarial training's effect from feature reduction toward expansion. 
<strong>(a)</strong> Single-layer networks on MNIST demonstrate capacity-dependent transitions: MLPs with hidden dimensions $h \in \{8, 32, 128, 512\}$ (top) and CNNs with filter counts $c \in \{8, 16, 32, 64\}$ (bottom) show that narrow networks reduce features while wide networks expand them across task complexities. 
<strong>(b)</strong> ResNet-18 on CIFAR-10 with width scaling (1×, 1/2×, 1/4×) reveals layer-wise specialization: early layers reduce features while deeper layers (layer 3–4) expand dramatically, with this pattern dampening as width decreases. Dashed lines: clean data; solid lines: adversarial examples. Feature count ratios normalized to baseline.
(View PDFs: 
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/capacity_simple.pdf" target="_blank">(a)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/capacity_complex.pdf" target="_blank">(b)</a>
)
</figcaption>
</figure>

<figure id="fig:statistical_analysis">
<div class="row" style="align-items: center; --img-height: 132px;">
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/complexity.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/capacity-1layer.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
<div class="col">
<img src="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/capacity-resnet.png" style="height: var(--img-height); width:auto; margin:0 auto; display:block;">
</div>
</div>

<figcaption style="color: var(--global-text-color);">
<strong>Figure 9:</strong> Statistical analysis of adversarial training effects on superposition. Normalized slopes quantify feature count changes per unit adversarial strength $\epsilon$; positive slopes indicate adversarial training <em>increases</em> features, negative slopes indicate <em>reduction</em>. 
<strong>(a)</strong> Task complexity (number of classes + dataset difficulty) shows consistent negative relationship with slopes: higher complexity yields more negative slopes. Fashion-MNIST (green) produces systematically lower slopes than MNIST (yellow), consistent with its greater difficulty. 
<strong>(b)</strong> Single-layer networks on MNIST show capacity-dependent transitions: narrow networks (8–32 units) have negative slopes regardless of task complexity, while wide networks (128–512 units) have positive slopes. 
<strong>(c)</strong> ResNet-18 on CIFAR-10 demonstrates log-linear scaling: wider networks show dramatically more positive slopes. Error bars show standard errors.
(View PDFs: 
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/complexity.pdf" target="_blank">(a)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/capacity-1layer.pdf" target="_blank">(b)</a>
<a href="{{site.baseurl}}/assets/img/posts/2025-12-12-superposition/capacity-resnet.pdf" target="_blank">(c)</a>
)
</figcaption>
</figure>

**Complexity shifts adversarial training toward feature reduction (H2 supported).** Contrary to H1's prediction of universal reduction, adversarial training produces bidirectional effects whose direction depends systematically on task complexity (<a href="#fig:task_complexity_effects" class="figure-ref">Figure 7</a> and <a href="#fig:statistical_analysis" class="figure-ref">Figure 9a</a>). Our meta-analysis reveals significant heterogeneity across conditions ($Q = 8.047$, $df = 3$, $p = 0.045$), necessitating random-effects modeling. The combined effect confirms H2: a negative relationship between task complexity and the adversarial training slope (slope $= -0.745 \pm 0.122$, $z = -6.14$, $p < 0.001$), meaning higher complexity shifts the effect from expansion toward reduction.

Binary classification consistently yields positive slopes, with feature counts expanding up to 2× baseline. Networks appear to develop additional defensive features when task demands are simple. Ten-class problems show negative slopes, with feature counts decreasing by up to 60%, particularly in early layers. Three-class tasks exhibit intermediate behavior with inverted-U curves: moderate adversarial training ($\epsilon = 0.1$) initially expands features before stronger training ($\epsilon = 0.3$) triggers reduction.

Dataset difficulty amplifies these effects. Fashion-MNIST produces systematically more negative slopes than MNIST (mean difference $= -1.467 \pm 0.156$, $t(7) = -2.405$, $p = 0.047$, Cohen's $d = -0.85$), consistent with its design as a more challenging benchmark <d-cite key="xiao_fashionmnist_2017"></d-cite>. This suggests that representational demands, beyond mere class count, drive defensive strategies.

Layer-wise patterns differ between architectures: MLP first layers reduce most while CNN second layers reduce most. We lack a mechanistic explanation for this divergence.

**Capacity shifts adversarial training toward feature expansion (H3 supported).** Network capacity exhibits a positive relationship with the adversarial training slope, strongly supporting H3 (<a href="#fig:capacity_effects" class="figure-ref">Figure 8</a>, <a href="#fig:statistical_analysis" class="figure-ref">Figure 9b, 9c</a>). Single-layer networks demonstrate clear capacity thresholds (meta-analytic slope $= 0.220 \pm 0.037$, $z = 5.90$, $p < 0.001$). Networks with minimal capacity (8 hidden units for MLPs, 8 filters for CNNs) show negative slopes—reducing features across all task complexities—while high-capacity networks (512 units/64 filters) show positive slopes, expanding features even for 10-class problems.

This capacity dependence scales dramatically in deep architectures. ResNet-18 on CIFAR-10 exhibits a strong log-linear relationship between width multiplier and adversarial training slopes (slope $= 31.0 \pm 2.0$ per $\log(\text{width})$, $t(2) = 15.7$, $p = 0.004$, $R^2 = 0.929$). An 8-fold width increase (0.25× to 2×) produces a 65-unit change in normalized slope. At minimal width (0.25×), adversarial training barely affects feature counts; at double width, networks show massive feature expansion with slopes approaching 80.

The layer-wise progression in ResNet-18 reveals hierarchical specialization: early layers (conv1, layer1) reduce features by up to 50%, middle layers remain stable, while deep layers (layer3, layer4) expand up to 4×. Systematically narrowing the network dampens this pattern: at 1/4 width, late-layer expansion vanishes while early-layer reduction persists but weakens. This could reflect vulnerability hierarchies, where early layers processing low-level statistics are easily exploited by imperceptible perturbations, necessitating feature reduction, while late layers encoding semantic information can safely expand their representational repertoire.

**Two regimes of adversarial response.** Our findings reveal a more nuanced relationship between superposition and adversarial vulnerability than originally theorized. Rather than universal feature reduction, adversarial training operates in two distinct regimes determined by the ratio of task demands to network capacity.

<div class="custom-box" style="--box-bg-color: #FDFBF7; --box-border-color: #E8BF69; --box-text-color: #000000;">
  <h4 class="custom-title">Bifurcation Driven by Task Complexity to Network Capacity Ratio</h4>
  <div class="custom-content">
    Adversarial training's effect on superposition depends on the ratio of task demands to network capacity:
    <ul>
    <li><strong>Abundance regime</strong> (low complexity / high capacity): Adversarial training <em>increases</em> effective features. Networks add defensive features, achieving robustness through elaboration.</li>
    <li><strong>Scarcity regime</strong> (high complexity / low capacity): Adversarial training <em>decreases</em> effective features. Networks prune to fewer, potentially more orthogonal features, as predicted by the superposition-vulnerability hypothesis.</li>
    </ul>
  </div>
</div>

<!-- <div style="background-color: #FDFBF7; border-left: 4px solid #E8BF69; padding: 1.5em; margin: 1.5em 0;"> -->
<!-- <h4 style="margin-top: 0; color: #E8BF69;">Bifurcation Driven by Task Complexity to Network Capacity Ratio</h4> -->
<!-- <p>Adversarial training's effect on superposition depends on the ratio of task demands to network capacity:</p> -->
<!-- <ul style="margin-bottom: 0;"> -->
<!-- <li><strong>Abundance regime</strong> (low complexity / high capacity): Adversarial training <em>increases</em> effective features. Networks add defensive features, achieving robustness through elaboration.</li> -->
<!-- <li><strong>Scarcity regime</strong> (high complexity / low capacity): Adversarial training <em>decreases</em> effective features. Networks prune to fewer, potentially more orthogonal features, as predicted by the superposition-vulnerability hypothesis.</li> -->
<!-- </ul> -->
<!-- </div> -->

**Unexplained patterns.** Several patterns in our data remain unexplained. We observe non-monotonic inverted-U curves where moderate adversarial training ($\epsilon = 0.1$) expands features while stronger training ($\epsilon = 0.3$) reduces them below baseline. The gap between clean and adversarial feature counts varies unpredictably; sometimes negligible, sometimes substantial. Some results contradict our complexity hypothesis, with 2-class MLPs occasionally showing lower feature counts than 3-class. CNN experiments consistently yield stronger statistical significance ($p < 0.02$) than equivalent MLP experiments ($p \approx 0.09$) for unknown reasons.

**Implications for interpretability.** Our findings complicate simple accounts of why robust models often appear more interpretable <d-cite key="engstrom_adversarial_2019"></d-cite>. If interpretability benefits arose purely from reduced representational complexity, we would expect universal feature reduction under adversarial training. The existence of an abundance regime where feature counts *increase* suggests alternative mechanisms: perhaps non-interpretable shortcut features are replaced by richer, more human-aligned representations, or perhaps interpretability benefits are confined to the scarcity regime. Resolving this requires interpretability metrics beyond the scope of our current framework.

The bidirectional relationship between robustness and superposition suggests that achieving robustness without capability loss may require ensuring sufficient capacity for defensive elaboration. While our experiments demonstrate that increased robustness can coincide with either increased or decreased superposition depending on the regime, establishing the exact causal connection between superposition and robustness remains an important direction for future work.

## Limitations

Our superposition measurement framework is limited by its dependence on sparse autoencoder quality, theoretical assumptions about neural feature representation, and should be interpreted as a proxy for representational complexity rather than a literal feature count.

**Sparse autoencoder quality.** Our approach inherently depends on sparse autoencoder feature extraction quality. While recent architectural advances (gated SAEs <d-cite key="rajamanoharan_improving_2024"></d-cite>, TopK variants <d-cite key="gao_scaling_2024"></d-cite>, and end-to-end training <d-cite key="braun_identifying_2024"></d-cite>) have substantially improved feature recovery, fundamental challenges remain. SAE training exhibits sensitivity to hyperparameters, particularly $\ell_1$ regularization strength and dictionary size, with different initialization or training procedures potentially yielding different feature counts for identical networks. Ghost features—SAE artifacts without computational relevance <d-cite key="gao_scaling_2024"></d-cite>—can artificially inflate measurements, while poor reconstruction quality may deflate them.

**Assumptions on feature representation.** Our framework rests on several assumptions that real networks systematically violate. The linear representation assumption (that features correspond to directions in activation space) has been challenged by recent discoveries of circular feature organization for temporal concepts <d-cite key="engels_not_2024"></d-cite> and complex geometric structures beyond simple directions <d-cite key="black_interpreting_2022"></d-cite>. Our entropy calculation assumes features contribute independently to representation, but neural networks exhibit extensive feature correlations, synergistic information where feature combinations provide more information than individual contributions, and gating mechanisms where some features control others' activation. The approximation that sparse linear encoding captures true computational structure breaks down in hierarchical representations where low-level and high-level features are not substitutable, and in networks with substantial nonlinear feature interactions that cannot be decomposed additively.

**Comparative rather than absolute count.** Our measure quantifies effective representational diversity under specific assumptions rather than providing literal feature counts. This creates several interpretational limitations. The measure exhibits sensitivity to the activation distribution used for measurement. SAE training distributions must match the network's operational regime to avoid systematic bias. Feature granularity remains fundamentally ambiguous: broader features may decompose into specific ones in wider SAEs, creating uncertainty about whether we're discovering or creating features. Our single-layer analysis potentially misses features distributed across layers through residual connections or attention mechanisms. Most critically, we measure the effective alphabet size of the network's internal communication channel rather than counting distinct computational primitives, making comparative rather than absolute interpretation most appropriate.

The limitations largely reflect active research areas in sparse dictionary learning and mechanistic interpretability. Each advance in SAE architectures, training procedures, or theoretical understanding directly benefits measurement quality. Within its scope—comparative analysis of representational complexity under sparse linear encoding assumptions—the measure enables systematic investigation of neural information structure previously impossible.

## Future Work

**Cross-model feature alignment.** Following Anthropic's crosscoder approach <d-cite key="templeton_scaling_2024"></d-cite>, training joint SAEs across clean and adversarially-trained models would enable direct feature comparison. This could reveal whether the abundance regime involves feature elaboration (creating defensive variants) versus feature replacement (substituting vulnerable features with robust ones).

**Multi-scale and cross-layer measurement.** Current layer-wise analysis may miss features distributed across layers through residual connections. Matryoshka SAEs <d-cite key="bussmann_learning_2025"></d-cite> already capture feature hierarchies at different granularities within single layers; extending this to cross-layer analysis could reveal how abstract features decompose into concrete features through network depth. Applying our entropy measure at each scale and depth would quantify information organization across both dimensions. Implementation requires developing new SAE architectures that span multiple layers.

**Feature co-occurrence and splitting.** Our independence assumption breaks when features consistently co-activate, yet this structure may be crucial for resolving feature splitting across dictionary scales. As we expand SAE dictionaries, single computational features can decompose into multiple SAE features—artificially inflating our count. Features that always co-occur likely represent such spurious decompositions rather than genuinely independent components. We initially attempted eigenvalue decomposition of feature co-occurrence matrices to identify such dependencies, but this approach faces a fundamental rank constraint: covariance matrices have rank at most $N$ (the neuron count), making it impossible to detect superposition beyond the physical dimension. Alternative approaches include mutual information networks between features or hierarchical clustering of co-occurrence patterns. Combining these with Matryoshka SAEs' multi-scale dictionaries could reveal which features remain coupled across granularities (likely representing single computational primitives) versus those that split independently (likely representing distinct features). This would provide a principled solution to the dictionary scaling problem: count only features that disentangle across scales.

**Causal intervention experiments.** While we demonstrate correlation between adversarial training and superposition changes, establishing causality requires targeted interventions: *i.)* artificially constraining superposition via architectural modifications (e.g., softmax linear units <d-cite key="elhage_softmax_2022"></d-cite>) then measuring robustness changes; *ii.)* directly manipulating feature sparsity in synthetic tasks; *iii.)* using mechanistic interpretability tools to trace how specific features contribute to adversarial vulnerability.

**Validation at scale.** Testing our framework on contemporary architectures (billion-parameter LLMs, Vision Transformers, diffusion models) would reveal whether findings generalize. Scale might expose new phenomena in adversarial training: very large models may escape capacity constraints entirely, or scaling laws might reveal limits on compression efficiency while maintaining robustness. If validated, our metric could guide architecture search for interpretable models by incorporating superposition measurement into training objectives or architecture design.

**Connection to model compression.** Our lossy compression perspective parallels findings in model compression research <d-cite key="pavlitska_relationship_2023"></d-cite>. Both superposition (internal compression) and model compression (parameter reduction) force networks to optimize information encoding under constraints. Formalizing this connection through rate-distortion theory could yield theoretical bounds on the robustness-compression tradeoff, explaining when compression helps versus hurts.

## Conclusion

This work provides a precise, measurable definition of superposition. Previous accounts characterized superposition qualitatively, as networks encoding "more features than neurons"; we formalize it as *lossy compression*: encoding beyond the interference-free limit. Applying Shannon entropy to sparse autoencoder activations yields the effective degrees of freedom: the minimum neurons required for lossless transmission of the observed feature distribution. Superposition occurs when this count exceeds the layer's actual dimension.

The framework enables testing previously untestable hypotheses. The superposition-vulnerability hypothesis <d-cite key="elhage_toy_2022"></d-cite> predicts that adversarial training should universally reduce superposition as networks trade representational efficiency for orthogonality. We find instead that the effect depends on the ratio of task demands to network capacity: an *abundance* regime where simple tasks permit feature expansion, and a *scarcity* regime where complexity forces reduction. By grounding superposition in information theory, this work makes quantitative what was previously only demonstrable in toy settings.

---

[^1]: In toy models where the input dimension $M$ is known, $F$ ranges from $N$ to $M$ depending on sparsity; in real networks $M$ is undefined and we estimate $F$ directly.

[^2]: Why not measure SAE weights instead of activations? Weight magnitude $\lVert \mathbf{w}_i\rVert$ indicates potential representation but misses actual usage: "dead features" may exist in the dictionary without ever activating. Empirically, a weight-based measure succeeds only in toy models; small toy transformer models already require our activation-based approach.

[^3]: While we generally recommend comparative interpretation due to measurement limitations, the systematic $F=N$ boundary tracking and performance decline when violated suggest our measure may provide meaningful absolute effective feature counts in sufficiently constrained computational settings.
