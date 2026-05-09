import { UploadProvider } from "@hyperserve/video-uploader";
import {
	FileList,
	FileListToolbar,
	FilePicker,
	ViewModeProvider,
} from "@hyperserve/video-uploader-react-native";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { demoConfig, pickVideos } from "./shared";

export default function App() {
	return (
		<SafeAreaProvider>
			<UploadProvider config={demoConfig}>
				<SafeAreaView style={styles.container}>
					<StatusBar style="dark" />
					<ScrollView contentContainerStyle={styles.scroll}>
						<Text style={styles.title}>Video Upload</Text>
						<Text style={styles.subtitle}>
							Upload videos to Hyperserve for transcoding and streaming.
						</Text>
						<Text style={styles.serverNote}>
							Start the server: bun run server
						</Text>
						<ViewModeProvider>
							<View style={styles.controls}>
								<FilePicker pickFiles={pickVideos} />
								<FileListToolbar right={<FileListToolbar.ViewToggle />} />
							</View>
							<FileList emptyMessage="No files selected yet." />
						</ViewModeProvider>
					</ScrollView>
				</SafeAreaView>
			</UploadProvider>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: { backgroundColor: "#fff", flex: 1 },
	controls: { gap: 10, marginBottom: 12 },
	scroll: { padding: 20, paddingTop: 48 },
	serverNote: {
		color: "#94a3b8",
		fontFamily: "monospace",
		fontSize: 12,
		marginBottom: 24,
	},
	subtitle: { color: "#64748b", fontSize: 15, marginBottom: 8 },
	title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
});
