import React, { useEffect, useState } from "react";
import { getDataset } from "../../api/dataset";
import { toast } from "react-toastify";

const PembersihanData = () => {
	const [loading, setLoading] = useState(true);
	const [summary, setSummary] = useState(null);
	const [datasetBefore, setDatasetBefore] = useState([]);
	const [datasetAfter, setDatasetAfter] = useState([]);
	const [activeTab, setActiveTab] = useState("before");
	const [currentPageBefore, setCurrentPageBefore] = useState(1);
	const [currentPageAfter, setCurrentPageAfter] = useState(1);
	const itemsPerPage = 10;

	const fetchData = async () => {
		try {
			const res = await getDataset();
			// support two shapes: either API returned inner object directly or nested under `data`
			const payload = res?.data ? res.data : res;
			setSummary(payload?.ringkasan_dataset_sebelum_pembersihan ? payload : payload?.data || null);
			setDatasetBefore(payload?.dataset_sebelum_pembersihan || []);
			setDatasetAfter(payload?.dataset_setelah_pembersihan || []);
		} catch (err) {
			toast.error(err.message || "Gagal mengambil data pembersihan");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const renderKeyRows = (keys, beforeObj, afterObj) => (
		keys.map((k) => (
			<tr key={k}>
				<td className="text-start">{k.replaceAll("_", " ")}</td>
				<td>{beforeObj?.[k] ?? 0}</td>
				<td>{afterObj?.[k] ?? 0}</td>
			</tr>
		))
	);

	const getPaginatedData = (data, currentPage) => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return data.slice(startIndex, endIndex);
	};

	const getTotalPages = (data) => Math.ceil(data.length / itemsPerPage);

	const renderPaginationControls = (totalPages, currentPage, setCurrentPage) => {
		if (totalPages <= 1) return null;

		const pages = [];
		for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
			pages.push(i);
		}

		return (
			<div className="d-flex justify-content-center align-items-center gap-2 mt-3">
				<button
					className="btn btn-sm"
					onClick={() => setCurrentPage(currentPage - 1)}
					disabled={currentPage === 1}
					style={{
						background: currentPage === 1 ? "#e9ecef" : "linear-gradient(90deg,#ff7a18,#ffb347)",
						color: currentPage === 1 ? "#6c757d" : "#fff",
						border: "none",
						borderRadius: "4px",
						padding: "6px 12px",
						fontWeight: 600,
					}}
				>
					← Sebelumnya
				</button>

				<div className="d-flex gap-1">
					{currentPage > 3 && (
						<>
							<button
								className="btn btn-sm"
								onClick={() => setCurrentPage(1)}
								style={{
									background: "#f0f0f0",
									color: "#000",
									border: "1px solid #ddd",
									borderRadius: "4px",
									padding: "6px 10px",
									fontWeight: 500,
								}}
							>
								1
							</button>
							{currentPage > 4 && <span className="text-muted" style={{ padding: "6px 4px" }}>...</span>}
						</>
					)}

					{pages.map((p) => (
						<button
							key={p}
							className="btn btn-sm"
							onClick={() => setCurrentPage(p)}
							style={{
								background: p === currentPage ? "linear-gradient(90deg,#ff7a18,#ffb347)" : "#f0f0f0",
								color: p === currentPage ? "#fff" : "#000",
								border: p === currentPage ? "none" : "1px solid #ddd",
								borderRadius: "4px",
								padding: "6px 10px",
								fontWeight: p === currentPage ? 700 : 500,
								transition: "all 0.2s",
							}}
						>
							{p}
						</button>
					))}

					{currentPage < totalPages - 2 && (
						<>
							{currentPage < totalPages - 3 && <span className="text-muted" style={{ padding: "6px 4px" }}>...</span>}
							<button
								className="btn btn-sm"
								onClick={() => setCurrentPage(totalPages)}
								style={{
									background: "#f0f0f0",
									color: "#000",
									border: "1px solid #ddd",
									borderRadius: "4px",
									padding: "6px 10px",
									fontWeight: 500,
								}}
							>
								{totalPages}
							</button>
						</>
					)}
				</div>

				<button
					className="btn btn-sm"
					onClick={() => setCurrentPage(currentPage + 1)}
					disabled={currentPage === totalPages}
					style={{
						background: currentPage === totalPages ? "#e9ecef" : "linear-gradient(90deg,#ff7a18,#ffb347)",
						color: currentPage === totalPages ? "#6c757d" : "#fff",
						border: "none",
						borderRadius: "4px",
						padding: "6px 12px",
						fontWeight: 600,
					}}
				>
					Berikutnya →
				</button>

				<span className="text-muted ms-2" style={{ fontSize: "0.85rem" }}>
					Halaman {currentPage} dari {totalPages}
				</span>
			</div>
		);
	};

	return (
		<div className="container" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
			<div className="d-flex align-items-center mb-3" style={{ gap: "8px" }}>
				<h3 className="mb-0">🧹 Pembersihan Data</h3>
			</div>

			{loading && (
				<p className="text-muted" style={{ fontStyle: "italic" }}>Memuat data...</p>
			)}

			{!loading && !summary && (
				<div className="alert alert-info">Tidak ada data ringkasan pembersihan tersedia</div>
			)}

			{summary && (
				<>
					<div className="row gx-3 mb-3">
						<div className="col-md-6 mb-2">
							<div className="card">
								<div className="card-body">
									<h6 className="card-title" style={{ fontWeight: 700, fontSize: "1.02rem", display: 'flex', alignItems: 'center', gap: 8 }}>
										<span>🗂️</span>
										Ringkasan Sebelum Pembersihan
									</h6>
									<div className="d-flex justify-content-between align-items-center">
										<div>
											<div className="text-muted">Jumlah Seluruh Data</div>
											<h5>{summary.ringkasan_dataset_sebelum_pembersihan?.jumlah_seluruh_data ?? '-'}</h5>
										</div>
										<div>
											<div className="text-muted">Jumlah Duplikat</div>
											<h5>{summary.ringkasan_dataset_sebelum_pembersihan?.jumlah_data_duplikat ?? '-'}</h5>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="col-md-6 mb-2">
							<div className="card">
								<div className="card-body">
									<h6 className="card-title" style={{ fontWeight: 700, fontSize: "1.02rem", display: 'flex', alignItems: 'center', gap: 8 }}>
										<span>✅</span>
										Ringkasan Setelah Pembersihan
									</h6>
									<div className="d-flex justify-content-between align-items-center">
										<div>
											<div className="text-muted">Jumlah Data</div>
											<h5>{summary.ringkasan_dataset_setelah_pembersihan?.jumlah_data ?? '-'}</h5>
										</div>
										<div>
											<div className="text-muted">Jumlah Duplikat</div>
											<h5>{summary.ringkasan_dataset_setelah_pembersihan?.jumlah_data_duplikat ?? '-'}</h5>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="row">
						<div className="col-lg-6 mb-3">
							<div className="card">
								<div className="card-body">
									<h6 className="card-title" style={{ fontWeight: 700, fontSize: "1.02rem", display: 'flex', alignItems: 'center', gap: 8 }}>
										<span>⚠️</span>
										Jumlah Data Hilang (per kolom)
									</h6>
									<div className="table-responsive" style={{ maxHeight: "50vh", overflowY: "auto" }}>
										<table className="table table-sm table-bordered mb-0">
											<thead className="table-light">
												<tr>
													<th className="text-start">Kolom</th>
													<th>Sebelum</th>
													<th>Setelah</th>
												</tr>
											</thead>
											<tbody>
												{(() => {
													const before = summary.ringkasan_dataset_sebelum_pembersihan?.jumlah_data_hilang_per_kolom || {};
													const after = summary.ringkasan_dataset_setelah_pembersihan?.jumlah_data_hilang_per_kolom || {};
													const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
													return renderKeyRows(keys, before, after);
												})()}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>

						<div className="col-lg-6 mb-3">
							<div className="card">
								<div className="card-body">
									<h6 className="card-title" style={{ fontWeight: 700, fontSize: "1.02rem", display: 'flex', alignItems: 'center', gap: 8 }}>
										<span>📈</span>
										Jumlah Outlier (per kolom)
									</h6>
									<div className="table-responsive" style={{ maxHeight: "50vh", overflowY: "auto" }}>
										<table className="table table-sm table-bordered mb-0">
											<thead className="table-light">
												<tr>
													<th className="text-start">Kolom</th>
													<th>Sebelum</th>
													<th>Setelah</th>
												</tr>
											</thead>
											<tbody>
												{(() => {
													const before = summary.ringkasan_dataset_sebelum_pembersihan?.jumlah_outlier_per_kolom || {};
													const after = summary.ringkasan_dataset_setelah_pembersihan?.jumlah_outlier_per_kolom || {};
													const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
													return renderKeyRows(keys, before, after);
												})()}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Dataset Tabs */}
					<div className="card mt-4">
						<div className="card-body">
							<h6 className="card-title" style={{ fontWeight: 700, fontSize: "1.02rem", display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
								<span>📋</span>
								Data Lengkap
							</h6>

							{/* Tab Navigation */}
							<ul className="nav nav-tabs" role="tablist" style={{ borderBottom: "2px solid #ff7a18", marginBottom: '1rem' }}>
								<li className="nav-item" role="presentation">
									<button
										className="nav-link"
										onClick={() => setActiveTab("before")}
										style={{
											color: activeTab === "before" ? "#fff" : "#000",
											background: activeTab === "before" ? "linear-gradient(90deg,#ff7a18,#ffb347)" : "transparent",
											border: "none",
											borderRadius: "6px 6px 0 0",
											padding: "8px 16px",
											fontWeight: 600,
											transition: "all 0.3s ease",
										}}
										role="tab"
										aria-selected={activeTab === "before"}
									>
										🗂️ Sebelum Pembersihan
									</button>
								</li>
								<li className="nav-item" role="presentation">
									<button
										className="nav-link"
										onClick={() => setActiveTab("after")}
										style={{
											color: activeTab === "after" ? "#fff" : "#000",
											background: activeTab === "after" ? "linear-gradient(90deg,#ff7a18,#ffb347)" : "transparent",
											border: "none",
											borderRadius: "6px 6px 0 0",
											padding: "8px 16px",
											fontWeight: 600,
											transition: "all 0.3s ease",
											marginLeft: "4px",
										}}
										role="tab"
										aria-selected={activeTab === "after"}
									>
										✅ Setelah Pembersihan
									</button>
								</li>
							</ul>

							{/* Tab Content */}
							<div className="tab-content">
								{activeTab === "before" && (
									<>
										<div className="table-responsive" style={{ maxHeight: "60vh", overflowY: "auto" }}>
											<table className="table table-striped table-bordered align-middle mb-0" style={{ fontSize: "0.9rem" }} data-typing-done="true">
												<thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 2 }}>
													<tr>
														<th style={{ width: "40px" }} className="text-center">No</th>
														{datasetBefore.length > 0 && Object.keys(datasetBefore[0]).map((col) => (
															<th key={col} className="text-start" style={{ minWidth: "120px" }}>
																{col.replaceAll("_", " ")}
															</th>
														))}
													</tr>
												</thead>
												<tbody>
													{datasetBefore.length > 0 ? (
														getPaginatedData(datasetBefore, currentPageBefore).map((row, idx) => (
															<tr key={idx}>
																<td className="text-center" style={{ fontWeight: 600, background: "#f8f9fa" }} data-typing-done="true">
																	{(currentPageBefore - 1) * itemsPerPage + idx + 1}
																</td>
																{Object.values(row).map((val, vidx) => (
																	<td key={vidx} className="text-start" data-typing-done="true">
																		{val}
																	</td>
																))}
															</tr>
														))
													) : (
														<tr>
															<td colSpan="100%" className="text-center text-muted py-3" data-typing-done="true">
																Tidak ada data
															</td>
														</tr>
													)}
												</tbody>
											</table>
										</div>
										{renderPaginationControls(getTotalPages(datasetBefore), currentPageBefore, setCurrentPageBefore)}
									</>
								)}

								{activeTab === "after" && (
									<>
										<div className="table-responsive" style={{ maxHeight: "60vh", overflowY: "auto" }}>
											<table className="table table-striped table-bordered align-middle mb-0" style={{ fontSize: "0.9rem" }} data-typing-done="true">
												<thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 2 }}>
													<tr>
														<th style={{ width: "40px" }} className="text-center">No</th>
														{datasetAfter.length > 0 && Object.keys(datasetAfter[0]).map((col) => (
															<th key={col} className="text-start" style={{ minWidth: "120px" }}>
																{col.replaceAll("_", " ")}
															</th>
														))}
													</tr>
												</thead>
												<tbody>
													{datasetAfter.length > 0 ? (
														getPaginatedData(datasetAfter, currentPageAfter).map((row, idx) => (
															<tr key={idx}>
																<td className="text-center" style={{ fontWeight: 600, background: "#f8f9fa" }} data-typing-done="true">
																	{(currentPageAfter - 1) * itemsPerPage + idx + 1}
																</td>
																{Object.values(row).map((val, vidx) => (
																	<td key={vidx} className="text-start" data-typing-done="true">
																		{val}
																	</td>
																))}
															</tr>
														))
													) : (
														<tr>
															<td colSpan="100%" className="text-center text-muted py-3" data-typing-done="true">
																Tidak ada data
															</td>
														</tr>
													)}
												</tbody>
											</table>
										</div>
										{renderPaginationControls(getTotalPages(datasetAfter), currentPageAfter, setCurrentPageAfter)}
									</>
								)}
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default PembersihanData;